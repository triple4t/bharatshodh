import logging
from typing import List, Union, Optional
import numpy as np
from langchain_openai import AzureOpenAIEmbeddings
from sentence_transformers import SentenceTransformer
from config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    """
    Centralized service for generating text embeddings.
    Supports both local SentenceTransformers and Azure OpenAI Embeddings.
    """

    def __init__(self):
        self.azure_mode = bool(settings.azure_openai_embedding_endpoint)
        self._local_model = None
        self._azure_model = None

        if self.azure_mode:
            logger.info("Initializing Azure OpenAI Embedding Service")
            
            # Sanitize endpoint: strip any trailing paths like /openai/v1/embeddings
            endpoint = settings.azure_openai_embedding_endpoint or settings.azure_openai_endpoint
            if endpoint and "/openai" in endpoint:
                endpoint = endpoint.split("/openai")[0]
            
            # Ensure no trailing slash for cleaner construction
            endpoint = endpoint.rstrip("/")
            
            self._azure_model = AzureOpenAIEmbeddings(
                azure_endpoint=endpoint,
                api_key=settings.azure_openai_api_key,
                azure_deployment=settings.azure_openai_embedding_deployment_name,
                openai_api_version=settings.azure_openai_embedding_api_version or settings.azure_openai_api_version,
            )
        else:
            logger.info("Initializing Local SentenceTransformer Embedding Service")

    def _get_local_model(self):
        if self._local_model is None:
            model_name = getattr(settings, "semantic_cache_embedding_model", "all-MiniLM-L6-v2")
            logger.info(f"Loading local embedding model: {model_name}")
            self._local_model = SentenceTransformer(model_name)
        return self._local_model

    def embed_query(self, text: str) -> List[float]:
        """Embed a single query string"""
        if self.azure_mode:
            return self._azure_model.embed_query(text)
        else:
            embedding = self._get_local_model().encode(text, convert_to_numpy=True)
            return embedding.tolist()

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of document strings"""
        if self.azure_mode:
            return self._azure_model.embed_documents(texts)
        else:
            embeddings = self._get_local_model().encode(texts, convert_to_numpy=True)
            return embeddings.tolist()

    def encode(self, text: Union[str, List[str]], convert_to_numpy: bool = True) -> Union[np.ndarray, List[float], List[List[float]]]:
        """
        Compatibility shim for legacy code calling .encode().
        Always returns numpy array by default if convert_to_numpy is True.
        """
        if isinstance(text, str):
            embedding = self.embed_query(text)
            return np.array(embedding) if convert_to_numpy else embedding
        else:
            embeddings = self.embed_documents(text)
            return np.array(embeddings) if convert_to_numpy else embeddings

    @property
    def dimension(self) -> int:
        """Returns the dimension of the embeddings"""
        if self.azure_mode:
            # OpenAI models like text-embedding-3-small default to 1536
            # text-embedding-3-large can be up to 3072, but we use small/ada-002 usually
            return 1536 
        else:
            return self._get_local_model().get_sentence_embedding_dimension()

# Global instance
embedding_service = EmbeddingService()
