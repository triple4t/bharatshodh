import uuid
import logging
import json
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime
import base64

try:
    from sarvamai import SarvamAI
except ImportError:
    SarvamAI = None

import azure.cognitiveservices.speech as speechsdk
from models import Message, MessageRole, Chat, FileInfo, TTSRequest
from database import get_database
from config import settings
from .ai_service import ai_service
from .document_service import document_service  # For RAG


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


    def _clean_text_for_tts(self, text: str) -> str:
        """Remove markdown and special characters that shouldn't be spoken."""
        import re
        # Remove markdown bold/italic
        text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
        text = re.sub(r'\*(.*?)\*', r'\1', text)
        # Remove markdown links [text](url) -> text
        text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
        # Remove code blocks
        text = re.sub(r'`(.*?)`', r'\1', text)
        # Remove citations like [1], [2]
        text = re.sub(r'\[\d+\]', '', text)
        return text.strip()

    def sarvam_tts_audio_bytes(self, req: TTSRequest) -> bytes:
        if not settings.sarvam_api_key:
            raise ValueError("SARVAM_API_KEY is not set in configuration")
            
        if SarvamAI is None:
            raise ImportError("sarvamai package is not installed")

        try:
            client = SarvamAI(api_subscription_key=settings.sarvam_api_key)
            
            # Valid Sarvam voices
            VALID_VOICES = {
                'anushka', 'abhilash', 'manisha', 'vidya', 'arya', 'karun', 'hitesh', 
                'aditya', 'ritu', 'priya', 'neha', 'rahul', 'pooja', 'rohan', 'simran', 
                'kavya', 'amit', 'dev', 'ishita', 'shreya', 'ratan', 'varun', 'manan', 
                'sumit', 'roopa', 'kabir', 'aayan', 'shubh', 'ashutosh', 'advait', 
                'amelia', 'sophia', 'anand', 'tanya', 'tarun', 'sunny', 'mani', 'gokul', 
                'vijay', 'shruti', 'suhani', 'mohit', 'kavitha', 'rehan', 'soham', 'rupali'
            }
            
            # Map simplified voice IDs or use defaults if not specified
            # Ensure the requested voice is valid, otherwise default to 'shubh'
            speaker = req.voice_id if req.voice_id in VALID_VOICES else "shubh"
            
            # Clean text to remove symbols
            cleaned_text = self._clean_text_for_tts(req.text)
            
            # Use 'hi-IN' for Hindi text if detected, else 'en-IN'
            # For now, using 'en-IN' as default or based on request if we had language field
            target_language_code = "hi-IN" 
            
            # Generate speech
            response = client.text_to_speech.convert(
                text=cleaned_text,
                target_language_code=target_language_code,
                model="bulbul:v3", 
                speaker=speaker
            )
            
            logger.info(f"Sarvam Response Type: {type(response)}")

            # Check if it's the Pydantic model response
            if hasattr(response, 'audios') and response.audios:
                # It might have an 'audios' field which is a list of base64 strings
                audio_base64 = response.audios[0]
            elif hasattr(response, 'audio'):
                 audio_base64 = response.audio
            elif isinstance(response, list) and len(response) > 0:
                audio_base64 = response[0]
            elif isinstance(response, str):
                audio_base64 = response
            else:
                # Fallback: Many Pydantic models dump their main content via str() or model_dump()
                # But looking at previous error logs, it seems to print the object repr.
                # Let's try to inspect it via dict if possible or just use the first field.
                try:
                    # If it's a pydantic model
                    if hasattr(response, 'model_dump'):
                        data = response.model_dump()
                        if 'audios' in data:
                            audio_base64 = data['audios'][0]
                        elif 'audio' in data:
                            audio_base64 = data['audio']
                except:
                    pass
                
                if not audio_base64:
                    logger.warning(f"Could not extract audio from {type(response)}. Trying str()")
                    audio_base64 = str(response)

            # Clean potential garbage if string representation was used accidentally
            if isinstance(audio_base64, str):
                # Remove [' and '] if they exist (just in case)
                if audio_base64.startswith("['") and audio_base64.endswith("']"):
                    audio_base64 = audio_base64[2:-2]
            
            audio_data = base64.b64decode(audio_base64)
            return audio_data

        except Exception as e:
            logger.error(f"Sarvam TTS failed: {e}")
            raise RuntimeError(f"Sarvam TTS failed: {e}")

    def generate_tts_audio(self, req: TTSRequest) -> bytes:
        """Generate TTS audio using the configured provider."""
        provider = settings.tts_provider.lower()
        
        if provider == "sarvam":
            try:
                return self.sarvam_tts_audio_bytes(req)
            except Exception as e:
                logger.error(f"Sarvam TTS failed, falling back to Azure: {e}")
                # Fallback to Azure
                return self.azure_tts_audio_bytes(req)
        else:
            return self.azure_tts_audio_bytes(req)

chat_service = ChatService()


