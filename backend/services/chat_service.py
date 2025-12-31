
import uuid
from typing import List, Optional, Tuple, Iterator
from datetime import datetime
import logging
from database import get_database
from models import Chat, Message, MessageRole, FileInfo, TTSRequest
from services.ai_service import ai_service
from config import settings
import azure.cognitiveservices.speech as speechsdk



logger = logging.getLogger(__name__)


class ChatService:
    def __init__(self):
        self.db = None
    
    def get_db(self):
        if self.db is None:
            self.db = get_database()
        return self.db

    # ---------- Chats ----------

    async def create_chat(self, owner_id: str, title: str = "New Chat") -> Chat:
        chat_id = str(uuid.uuid4())
        now = datetime.utcnow()
        chat = Chat(
            id=chat_id,
            title=title,
            created_at=now,
            updated_at=now,
            message_count=0,
            owner_id=owner_id
        )
        db = self.get_db()
        data = chat.model_dump(by_alias=True)
        data["_id"] = chat_id
        await db.chats.insert_one(data)
        logger.info(f"Created new chat: {chat_id} for owner {owner_id}")
        return chat

    async def get_all_chats(self, owner_id: str) -> List[Chat]:
        db = self.get_db()
        cursor = db.chats.find({"owner_id": owner_id}).sort("updated_at", -1)
        items: List[Chat] = []
        async for doc in cursor:
            doc["id"] = doc.get("_id", "")
            items.append(Chat(**doc))
        return items

    async def get_chat(self, owner_id: str, chat_id: str) -> Optional[Chat]:
        db = self.get_db()
        doc = await db.chats.find_one({"_id": chat_id, "owner_id": owner_id})
        if not doc:
            return None
        doc["id"] = doc.get("_id", "")
        return Chat(**doc)

    async def rename_chat(self, owner_id: str, chat_id: str, new_title: str) -> bool:
        db = self.get_db()
        result = await db.chats.update_one(
            {"_id": chat_id, "owner_id": owner_id},
            {"$set": {"title": new_title, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0

    async def delete_chat(self, owner_id: str, chat_id: str) -> bool:
        db = self.get_db()
        await db.messages.delete_many({"chat_id": chat_id, "owner_id": owner_id})
        result = await db.chats.delete_one({"_id": chat_id, "owner_id": owner_id})
        logger.info(f"Deleted chat: {chat_id} for owner {owner_id}")
        return result.deleted_count > 0

    # ---------- Messages ----------

    async def get_chat_messages(self, owner_id: str, chat_id: str) -> List[Message]:
        db = self.get_db()
        cursor = db.messages.find({"chat_id": chat_id, "owner_id": owner_id}).sort("timestamp", 1)
        items: List[Message] = []
        async for doc in cursor:
            items.append(Message(**doc))
        return items

    async def add_message(
        self,
        owner_id: str,
        chat_id: str,
        role: MessageRole,
        content: str,
        file_info: Optional[FileInfo] = None,
        citations: Optional[List] = None  # NEW: Citations from RAG
    ) -> Message:
        # DEBUG: Log citations being saved
        if citations:
            logger.info(f"💾 SAVING MESSAGE WITH {len(citations)} CITATIONS")
        else:
            logger.info(f"💾 SAVING MESSAGE WITHOUT CITATIONS (citations={citations})")
            
        message = Message(
            chat_id=chat_id,
            role=role,
            content=content,
            file=file_info,
            timestamp=datetime.utcnow(),
            owner_id=owner_id,
            citations=citations  # NEW: Include citations
        )
        
        # DEBUG: Verify message object has citations
        logger.info(f"📋 Message object citations: {message.citations}")
        
        db = self.get_db()
        message_dict = message.model_dump()
        
        # DEBUG: Verify dict has citations before saving
        logger.info(f"📋 Message dict citations: {message_dict.get('citations')}")
        
        await db.messages.insert_one(message_dict)
        await db.chats.update_one(
            {"_id": chat_id, "owner_id": owner_id},
            {"$set": {"updated_at": datetime.utcnow()}, "$inc": {"message_count": 1}}
        )
        return message

    # ---------- Orchestration ----------

    async def process_message(
        self,
        owner_id: str,
        chat_id: str,
        content: str,
        *,
        original_content: Optional[str] = None,
        file_info: Optional[FileInfo] = None,
        web_search_results: Optional[str] = None,
        image_path: Optional[str] = None,
        rag_context: Optional[str] = None,
        citations: Optional[List] = None  # NEW: Citations from RAG
    ) -> Tuple[Message, Message]:
        # User message
        user_message = await self.add_message(
            owner_id=owner_id,
            chat_id=chat_id,
            role=MessageRole.USER,
            content=original_content or content,
            file_info=file_info
        )

        # Optional: web search system message
        if web_search_results:
            await self.add_message(
                owner_id=owner_id,
                chat_id=chat_id,
                role=MessageRole.SYSTEM,
                content=web_search_results
            )

        # Gather history
        messages = await self.get_chat_messages(owner_id, chat_id)

        # Get AI response - pass rag_context if provided
        ai_content = await ai_service.generate_response(messages, image_path, rag_context=rag_context)

        # Save AI message with citations
        ai_message = await self.add_message(
            owner_id=owner_id,
            chat_id=chat_id,
            role=MessageRole.ASSISTANT,
            content=ai_content,
            citations=citations  # NEW: Persist citations
        )

        # Auto-title if first round
        if len(messages) <= 2:
            try:
                title = await ai_service.generate_chat_title(content, ai_content)
                await self.rename_chat(owner_id, chat_id, title)
            except Exception as e:
                logger.error(f"Error generating chat title: {e}")

        return user_message, ai_message
    
    def azure_tts_audio_bytes(self, req: TTSRequest) -> bytes:
        
    
        speech_config = speechsdk.SpeechConfig(
            subscription=settings.azure_speech_key,
            region=settings.azure_speech_region,
        )
    
        speech_config.speech_synthesis_voice_name = req.voice_id
        speech_config.set_speech_synthesis_output_format(
            speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
        )
    
        synthesizer = speechsdk.SpeechSynthesizer(
            speech_config=speech_config,
            audio_config=None,
        )
    
        result = synthesizer.speak_text_async(req.text).get()
    
        if result.reason != speechsdk.ResultReason.SynthesizingAudioCompleted:
            raise RuntimeError(f"TTS failed: {result.reason}")
    
        # ✅ THIS IS THE KEY LINE
        return result.audio_data


chat_service = ChatService()

