
import os
import uuid
import shutil
import logging
from io import BytesIO
from typing import Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from fastapi.openapi.utils import get_openapi
from contextlib import asynccontextmanager
from datetime import datetime

import httpx

from config import settings
from database import connect_to_mongo, close_mongo_connection
from models import (
    Chat, ChatCreate, ChatRename, ChatResponse, ChatListResponse,
    ChatHistoryResponse, FileInfo, MessageCreate, SearchQuery, TTSRequest
)
from services.chat_service import chat_service #generate_wave_bytes, stream_bytes_in_chunks, wav_to_mp3_stream
from services.file_processor import file_processor
from security import get_current_user
from auth_router import router as auth_router
from admin_router import router as admin_router
from io import BytesIO

# Import semantic cache for stats endpoint (optional)
try:
    from services.semantic_cache import get_semantic_cache
    SEMANTIC_CACHE_AVAILABLE = True
except ImportError:
    SEMANTIC_CACHE_AVAILABLE = False


# ---------- Logging ----------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------- FastAPI lifespan ----------
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(
    title="ChatGPT Clone API",
    description="FastAPI backend with Azure GPT-4o, LangChain, and MongoDB",
    version="1.0.0",
    lifespan=lifespan
)

# Add OpenAPI security scheme for JWT
app.openapi_schema = None

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="ChatGPT Clone API",
        version="1.0.0",
        description="FastAPI backend with Azure GPT-4o, LangChain, and MongoDB",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "Bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:5173", "https://yourdomain.com"],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Static uploads ----------
UPLOAD_DIR = settings.upload_dir if hasattr(settings, "upload_dir") else "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ---------- Routers ----------
app.include_router(auth_router)
app.include_router(admin_router)

# ---------- Health ----------
@app.get("/")
async def root():
    return {"message": "ChatGPT Clone API is running"}

# ---------- Chats (scoped by user) ----------
@app.post("/api/chat/new", response_model=Chat)
async def create_new_chat(chat_data: ChatCreate, current=Depends(get_current_user)):
    try:
        chat = await chat_service.create_chat(owner_id=current["_id"], title=chat_data.title or "New Chat")
        return chat
    except Exception as e:
        logger.error(f"Error creating chat: {e}")
        raise HTTPException(status_code=500, detail="Failed to create chat")

@app.get("/api/chat", response_model=ChatListResponse)
async def get_all_chats(current=Depends(get_current_user)):
    try:
        chats = await chat_service.get_all_chats(owner_id=current["_id"])
        return ChatListResponse(chats=chats)
    except Exception as e:
        logger.error(f"Error fetching chats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch chats")

@app.get("/api/chat/{chat_id}", response_model=ChatHistoryResponse)
async def get_chat_history(chat_id: str, current=Depends(get_current_user)):
    try:
        chat = await chat_service.get_chat(owner_id=current["_id"], chat_id=chat_id)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        messages = await chat_service.get_chat_messages(owner_id=current["_id"], chat_id=chat_id)
        return ChatHistoryResponse(chat=chat, messages=messages)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching chat history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch chat history")

@app.put("/api/chat/{chat_id}/rename")
async def rename_chat(chat_id: str, rename_data: ChatRename, current=Depends(get_current_user)):
    try:
        ok = await chat_service.rename_chat(owner_id=current["_id"], chat_id=chat_id, new_title=rename_data.title)
        if not ok:
            raise HTTPException(status_code=404, detail="Chat not found")
        return {"message": "Chat renamed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error renaming chat: {e}")
        raise HTTPException(status_code=500, detail="Failed to rename chat")

@app.delete("/api/chat/{chat_id}")
async def delete_chat(chat_id: str, current=Depends(get_current_user)):
    try:
        ok = await chat_service.delete_chat(owner_id=current["_id"], chat_id=chat_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Chat not found")
        return {"message": "Chat deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting chat: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete chat")

# ---------- Chat messages ----------
@app.post("/api/chat/{chat_id}/message", response_model=ChatResponse)
async def send_message(chat_id: str, message_data: MessageCreate, current=Depends(get_current_user)):
    try:
        # verify chat belongs to user
        chat = await chat_service.get_chat(owner_id=current["_id"], chat_id=chat_id)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")

        user_msg, ai_msg = await chat_service.process_message(
            owner_id=current["_id"],
            chat_id=chat_id,
            content=message_data.content,
            original_content=message_data.original_content,
            web_search_results=message_data.web_search_results,
            image_path=None
        )
        return ChatResponse(chat_id=chat_id, message=user_msg, response=ai_msg)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        raise HTTPException(status_code=500, detail="Failed to process message")

# ---------- Web search passthrough ----------
@app.post("/api/web-search")
async def web_search(payload: SearchQuery, current=Depends(get_current_user)):
    query = payload.query
    if not query:
        return {"results": []}

    api_key = settings.google_api_key
    cx = settings.google_search_engine_id

    url = "https://www.googleapis.com/customsearch/v1"
    params = {"key": api_key, "cx": cx, "q": query, "num": 3}

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            result = resp.json()

        items = result.get("items", [])
        web_results = [{"name": it.get("title"), "url": it.get("link"), "snippet": it.get("snippet")} for it in items]
        print("🌐 Web search results:", web_results)
        return {"results": web_results}
    except Exception as e:
        return {"error": str(e), "results": []}

# ---------- File upload (scoped) ----------
@app.post("/api/chat/{chat_id}/upload", response_model=ChatResponse)
async def upload_file(
    chat_id: str,
    file: UploadFile = File(...),
    message: Optional[str] = Form(None),
    original_content: Optional[str] = Form(None),
    web_search_results: Optional[str] = Form(None),
    current=Depends(get_current_user),
):
    try:
        chat = await chat_service.get_chat(owner_id=current["_id"], chat_id=chat_id)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")

        max_size = getattr(settings, "max_file_size", 25 * 1024 * 1024)
        file_size = getattr(file, "size", None)
        if file_size and file_size > max_size:
            raise HTTPException(status_code=413, detail="File too large")

        # Save file
        file_id = str(uuid.uuid4())
        ext = os.path.splitext(file.filename or "")[1]
        stored_name = f"{file_id}{ext}"
        file_path = os.path.join(UPLOAD_DIR, stored_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Analyze
        processed_content, file_type = await file_processor.process_file(file_path, file.filename)

        file_info = FileInfo(
            filename=file.filename,
            type=file.content_type or "application/octet-stream",
            url=f"/uploads/{stored_name}",
            size=file_size or os.path.getsize(file_path),
        )

        combined_message = f"{message or ''}\n\n{processed_content}".strip()
        image_path = file_path if file_type == "image" else None

        user_msg, ai_msg = await chat_service.process_message(
            owner_id=current["_id"],
            chat_id=chat_id,
            content=combined_message,
            original_content=original_content,
            file_info=file_info,
            web_search_results=web_search_results,
            image_path=image_path
        )

        return ChatResponse(chat_id=chat_id, message=user_msg, response=ai_msg)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing file upload: {e}")
        raise HTTPException(status_code=500, detail="Failed to process file upload")
    

# --------------TTS (Text-to-Speech) --------------


@app.post("/api/tts")
async def generate_speech(data: TTSRequest):
    try:
        audio_bytes = chat_service.azure_tts_audio_bytes(data)

        if not audio_bytes:
            raise RuntimeError("Azure TTS returned empty audio")

        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={
                "Content-Length": str(len(audio_bytes)),
                "Accept-Ranges": "bytes",
                "Cache-Control": "no-store",
                "Content-Disposition": 'inline; filename="speech.mp3"',
            },
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------- Semantic Cache Management (Optional) ----------

@app.get("/api/cache/stats")
async def get_cache_stats(current=Depends(get_current_user)):
    """Get semantic cache statistics"""
    if not SEMANTIC_CACHE_AVAILABLE:
        return {
            "enabled": False,
            "message": "Semantic cache not available. Install dependencies: pip install -r requirements-semantic-cache.txt"
        }

    try:
        cache = get_semantic_cache()
        stats = cache.get_stats()
        return stats
    except Exception as e:
        logger.error(f"Error getting cache stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get cache stats: {str(e)}")


@app.post("/api/cache/clear")
async def clear_cache(current=Depends(get_current_user)):
    """Clear all semantic cache entries"""
    if not SEMANTIC_CACHE_AVAILABLE:
        raise HTTPException(
            status_code=400,
            detail="Semantic cache not available. Install dependencies: pip install -r requirements-semantic-cache.txt"
        )

    try:
        cache = get_semantic_cache()
        if not cache.enabled:
            return {"message": "Cache is not enabled"}

        cache.clear()
        return {"message": "Cache cleared successfully"}
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to clear cache: {str(e)}")

