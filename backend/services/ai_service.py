

import base64
from typing import List, Optional
from langchain_openai import AzureChatOpenAI
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from config import settings
from models import Message, MessageRole
import logging

logger = logging.getLogger(__name__)

# Import semantic cache (optional - will gracefully degrade if not available)
try:
    from services.semantic_cache import get_semantic_cache
    SEMANTIC_CACHE_AVAILABLE = True
except ImportError:
    logger.warning("Semantic cache not available - install dependencies with: pip install -r requirements-semantic-cache.txt")
    SEMANTIC_CACHE_AVAILABLE = False

class AIService:
    def __init__(self):
        self.llm = AzureChatOpenAI(
            azure_endpoint=settings.azure_openai_endpoint,
            api_key=settings.azure_openai_api_key,
            api_version=settings.azure_openai_api_version,
            deployment_name=settings.azure_openai_deployment_name,
            temperature=0.7,
            max_tokens=2000,
        )

        # Initialize semantic cache (lazy initialization)
        self._cache = None
        if SEMANTIC_CACHE_AVAILABLE:
            try:
                self._cache = get_semantic_cache()
                if self._cache and self._cache.enabled:
                    logger.info("Semantic caching enabled for AI service")
            except Exception as e:
                logger.error(f"Failed to initialize semantic cache: {e}")
                self._cache = None
        
        self.system_prompt = """You are a helpful AI assistant.

LANGUAGE RULES — STRICT:
• Always reply in the same language (and script) as the user’s latest message.
  – If the user writes in English, reply in English.
  – If the user writes in Hindi (देवनागरी), reply in Hindi (देवनागरी).
  – If the user writes Hinglish (e.g., “tum kon”), reply in Hinglish (“main AI hoon”).
  – If the user writes in another Indian language (Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Punjabi, Gujarati, etc.), reply in that language.
• If the user mixes languages, pick the predominant language and style they used.
• Do NOT translate unless they explicitly ask for a translation.
• If the user switches language mid-chat, immediately switch to that new language.

CAPABILITIES:
• Answer questions and have natural conversations.
• Analyze and summarize documents (PDF, Word, text files).
• Describe and analyze images.
• Maintain conversational context and give detailed, helpful answers.

STYLE:
• Be clear, concise, and friendly.
• Match the user’s formality (casual ↔ formal). Keep technical accuracy when needed.
• If the request is ambiguous, ask a brief clarifying question in the user’s language.

EXAMPLES (follow style and script exactly):
• User: “Who are you?” → Assistant (English): “I’m an AI assistant here to help.”
• User: “तुम कौन?” → Assistant (Hindi Devanagari): “मैं AI सहायक हूँ।”
• User: “tum kon” (Hinglish) → Assistant (Hinglish): “Main AI hoon.”
• User: “தமிழில் சொல்லுங்கள்” → Assistant (Tamil): “நான் ஒரு AI உதவியாளர்.”

SAFETY:
• Follow safety policies. If you must refuse, refuse briefly in the user’s language and offer a safer alternative in the same language.
Always be helpful, accurate, and maintain context from previous messages in the conversation.
Use markdown formatting when appropriate for better readability."""

    async def generate_response(self, messages: List[Message], image_path: Optional[str] = None, rag_context: Optional[str] = None) -> str:
        """Generate AI response based on conversation history"""
        try:
            # Extract the latest user query for caching
            latest_query = None
            if messages and messages[-1].role == MessageRole.USER:
                latest_query = messages[-1].content

            # Check semantic cache first (only for text queries without images)
            if self._cache and self._cache.enabled and latest_query and not image_path:
                cached_response = self._cache.get(latest_query, context_messages=messages[:-1])
                if cached_response:
                    return cached_response

            # Convert messages to LangChain format
            langchain_messages = []
            
            # Add system prompt
            langchain_messages.append(SystemMessage(content=self.system_prompt))
            
            # CRITICAL: If RAG context provided, add BEFORE conversation history
            if rag_context:
                rag_system_msg = f"""<<CRITICAL_DOCUMENT_MODE>>
YOU ARE NOW IN STRICT DOCUMENT QA MODE.

The following documents contain ALL the information needed to answer the user's question:

{rag_context}

MANDATORY RULES:
- Extract your answer ONLY from the documents above
- Cite sources as [1], [2], [3] after each fact
- DO NOT use your general knowledge for this question
- If the answer is not in the documents, say "This information is not found in the uploaded documents"
<</CRITICAL_DOCUMENT_MODE>>"""
                langchain_messages.append(SystemMessage(content=rag_system_msg))

            for msg in messages:
                if msg.role == MessageRole.USER:
                    if image_path and msg == messages[-1]:  # Latest message with image
                        # Handle image input
                        content = await self._create_image_message(msg.content, image_path)
                        langchain_messages.append(HumanMessage(content=content))
                    else:
                        langchain_messages.append(HumanMessage(content=msg.content))
                else:
                    langchain_messages.append(AIMessage(content=msg.content))

            # Generate response from LLM
            response = await self.llm.ainvoke(langchain_messages)
            ai_response = response.content

            # Store in cache (only for text queries without images)
            if self._cache and self._cache.enabled and latest_query and not image_path:
                self._cache.set(latest_query, ai_response, context_messages=messages[:-1])

            return ai_response

        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            return "I apologize, but I encountered an error while processing your request. Please try again."

    async def _create_image_message(self, text_content: str, image_path: str) -> List[dict]:
        """Create message content with image for vision model"""
        try:
            with open(image_path, "rb") as image_file:
                image_data = base64.b64encode(image_file.read()).decode('utf-8')
            
            # Determine image type
            image_type = "jpeg"
            if image_path.lower().endswith('.png'):
                image_type = "png"
            elif image_path.lower().endswith('.gif'):
                image_type = "gif"
            elif image_path.lower().endswith('.webp'):
                image_type = "webp"
            
            content = [
                {
                    "type": "text",
                    "text": text_content or "Please describe this image."
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/{image_type};base64,{image_data}"
                    }
                }
            ]
            
            return content
        except Exception as e:
            logger.error(f"Error processing image: {e}")
            return [{"type": "text", "text": f"{text_content}\n\n[Error: Could not process the uploaded image]"}]

    async def generate_chat_title(self, first_message: str, response: str) -> str:
        """Generate a suitable title for the chat"""
        try:
            prompt = f"""Based on this conversation, generate a short, descriptive title (max 50 characters):

User: {first_message}
Assistant: {response[:200]}...

Generate only the title, nothing else."""

            title_response = await self.llm.ainvoke([HumanMessage(content=prompt)])
            title = title_response.content.strip().strip('"').strip("'")
            
            # Ensure title is not too long
            if len(title) > 50:
                title = title[:47] + "..."
            
            return title
        except Exception as e:
            logger.error(f"Error generating chat title: {e}")
            # Fallback to simple title generation
            words = first_message.split()[:4]
            return " ".join(words) + ("..." if len(words) >= 4 else "")

ai_service = AIService()