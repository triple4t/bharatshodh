
import logging
import hashlib
import json
from typing import Optional, List, Dict, Any
import numpy as np
from sentence_transformers import SentenceTransformer
import redis
from redis.commands.search.field import VectorField, TextField, NumericField
from redis.commands.search.indexDefinition import IndexDefinition, IndexType
from redis.commands.search.query import Query
from config import settings
from .embedding_service import embedding_service

logger = logging.getLogger(__name__)


class SemanticCache:
    """
    Semantic caching using Redis with vector similarity search.

    This cache stores AI responses and retrieves them based on semantic similarity
    of queries, not just exact matches. Uses sentence embeddings to find similar
    previous queries.
    """

    def __init__(
        self,
        redis_host: str = "localhost",
        redis_port: int = 6379,
        redis_db: int = 0,
        redis_password: Optional[str] = None,
        similarity_threshold: float = 0.95,
        embedding_model: str = "all-MiniLM-L6-v2",
        ttl_seconds: int = 86400,  # 24 hours default
        enabled: bool = True
    ):
        """
        Initialize semantic cache.

        Args:
            redis_host: Redis server host
            redis_port: Redis server port
            redis_db: Redis database number
            redis_password: Redis password (optional)
            similarity_threshold: Minimum cosine similarity to consider a cache hit (0.0-1.0)
            embedding_model: Sentence transformer model for embeddings
            ttl_seconds: Time-to-live for cache entries in seconds
            enabled: Whether caching is enabled
        """
        self.enabled = enabled
        self.similarity_threshold = similarity_threshold
        self.ttl_seconds = ttl_seconds
        self.index_name = "semantic_cache_idx"
        self.prefix = "cache:"

        if not self.enabled:
            logger.info("Semantic cache is disabled")
            return

        try:
            # Initialize Redis connection
            # Auto-detect SSL based on port (Azure uses 6380 for SSL)
            use_ssl = redis_port == 6380

            self.redis_client = redis.Redis(
                host=redis_host,
                port=redis_port,
                db=redis_db,
                password=redis_password,
                ssl=use_ssl,
                ssl_cert_reqs=None if use_ssl else None,  # For Azure Redis
                decode_responses=False  # We handle encoding ourselves
            )

            # Test connection
            self.redis_client.ping()
            logger.info(f"Connected to Redis at {redis_host}:{redis_port}")

            # Initialize embedding info
            self.embedding_service = embedding_service
            self.embedding_dim = self.embedding_service.dimension
            logger.info(f"Semantic Cache using embedding dimension: {self.embedding_dim}")

            # Create or verify search index
            self._create_search_index()

            logger.info("Semantic cache initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize semantic cache: {e}")
            logger.warning("Continuing without cache - all queries will hit the AI service")
            self.enabled = False

    def _create_search_index(self):
        """Create Redis search index for vector similarity if it doesn't exist"""
        try:
            # Check if index exists
            try:
                self.redis_client.ft(self.index_name).info()
                logger.info(f"Search index '{self.index_name}' already exists")
                return
            except:
                pass

            # Create index
            schema = (
                VectorField(
                    "embedding",
                    "FLAT",
                    {
                        "TYPE": "FLOAT32",
                        "DIM": self.embedding_dim,
                        "DISTANCE_METRIC": "COSINE"
                    }
                ),
                TextField("query"),
                TextField("response"),
                TextField("context_hash"),
                NumericField("timestamp")
            )

            definition = IndexDefinition(
                prefix=[self.prefix],
                index_type=IndexType.HASH
            )

            self.redis_client.ft(self.index_name).create_index(
                fields=schema,
                definition=definition
            )

            logger.info(f"Created search index '{self.index_name}'")

        except Exception as e:
            logger.error(f"Error creating search index: {e}")
            raise

    def _compute_embedding(self, text: str) -> np.ndarray:
        """Compute embedding vector for text using the centralized service"""
        embedding = self.embedding_service.embed_query(text)
        return np.array(embedding, dtype=np.float32)

    def _create_context_hash(self, messages: List[Any]) -> str:
        """
        Create a hash of the conversation context.
        This ensures we only match queries from similar conversation contexts.
        """
        # Extract just the content and roles for hashing
        context_str = json.dumps([
            {"role": str(msg.role), "content": msg.content[:100]}  # First 100 chars
            for msg in messages[:-1]  # Exclude the latest message
        ])
        return hashlib.md5(context_str.encode()).hexdigest()

    def get(self, query: str, context_messages: Optional[List[Any]] = None) -> Optional[str]:
        """
        Retrieve cached response for semantically similar query.

        Args:
            query: The user query
            context_messages: Previous messages in the conversation for context

        Returns:
            Cached response if found, None otherwise
        """
        if not self.enabled:
            return None

        try:
            # Compute query embedding
            query_embedding = self._compute_embedding(query)

            # Create context hash
            context_hash = self._create_context_hash(context_messages) if context_messages else "no_context"

            # Search for similar queries with same context
            query_vector = query_embedding.astype(np.float32).tobytes()

            # KNN search query
            q = (
                Query(f"(@context_hash:{context_hash})=>[KNN 1 @embedding $vec AS score]")
                .sort_by("score")
                .return_fields("query", "response", "score")
                .paging(0, 1)
                .dialect(2)
            )

            params_dict = {"vec": query_vector}
            results = self.redis_client.ft(self.index_name).search(q, query_params=params_dict)

            if results.total > 0:
                doc = results.docs[0]
                similarity = 1 - float(doc.score)  # Convert distance to similarity

                if similarity >= self.similarity_threshold:
                    cached_query = doc.query
                    cached_response = doc.response
                    logger.info(
                        f"Cache HIT! Similarity: {similarity:.3f} | "
                        f"Query: '{query[:50]}...' | "
                        f"Cached: '{cached_query[:50]}...'"
                    )
                    return cached_response
                else:
                    logger.debug(
                        f"Cache MISS (low similarity {similarity:.3f}, threshold {self.similarity_threshold})"
                    )
            else:
                logger.debug("Cache MISS (no results)")

            return None

        except Exception as e:
            logger.error(f"Error retrieving from cache: {e}")
            return None

    def set(
        self,
        query: str,
        response: str,
        context_messages: Optional[List[Any]] = None
    ):
        """
        Store query-response pair in cache.

        Args:
            query: The user query
            response: The AI response
            context_messages: Previous messages in the conversation for context
        """
        if not self.enabled:
            return

        try:
            # Compute embedding
            query_embedding = self._compute_embedding(query)

            # Create context hash
            context_hash = self._create_context_hash(context_messages) if context_messages else "no_context"

            # Create unique key
            key = f"{self.prefix}{hashlib.md5(f'{query}{context_hash}'.encode()).hexdigest()}"

            # Store in Redis
            import time
            data = {
                "query": query,
                "response": response,
                "context_hash": context_hash,
                "embedding": query_embedding.astype(np.float32).tobytes(),
                "timestamp": int(time.time())
            }

            # Set with TTL
            self.redis_client.hset(key, mapping=data)
            if self.ttl_seconds > 0:
                self.redis_client.expire(key, self.ttl_seconds)

            logger.debug(f"Cached query: '{query[:50]}...'")

        except Exception as e:
            logger.error(f"Error storing in cache: {e}")

    def clear(self):
        """Clear all cache entries"""
        if not self.enabled:
            return

        try:
            # Delete all keys with our prefix
            keys = self.redis_client.keys(f"{self.prefix}*")
            if keys:
                self.redis_client.delete(*keys)
                logger.info(f"Cleared {len(keys)} cache entries")
            else:
                logger.info("Cache is already empty")
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        if not self.enabled:
            return {"enabled": False}

        try:
            keys = self.redis_client.keys(f"{self.prefix}*")
            info = self.redis_client.info("memory")

            return {
                "enabled": True,
                "total_entries": len(keys),
                "similarity_threshold": self.similarity_threshold,
                "ttl_seconds": self.ttl_seconds,
                "embedding_model": self.embedding_model.get_model_card_data().model_name if hasattr(self.embedding_model, 'get_model_card_data') else "unknown",
                "embedding_dim": self.embedding_dim,
                "redis_memory_used": info.get("used_memory_human", "unknown")
            }
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {"enabled": True, "error": str(e)}


# Initialize global semantic cache instance
def create_semantic_cache() -> SemanticCache:
    """Create semantic cache instance from settings"""
    try:
        # Get configuration from settings
        redis_host = getattr(settings, "redis_host", "localhost")
        redis_port = int(getattr(settings, "redis_port", 6379))
        redis_db = int(getattr(settings, "redis_db", 0))
        redis_password = getattr(settings, "redis_password", None)

        cache_enabled = getattr(settings, "semantic_cache_enabled", True)
        similarity_threshold = float(getattr(settings, "semantic_cache_threshold", 0.95))
        cache_ttl = int(getattr(settings, "semantic_cache_ttl_seconds", 86400))
        embedding_model = getattr(settings, "semantic_cache_embedding_model", "all-MiniLM-L6-v2")

        return SemanticCache(
            redis_host=redis_host,
            redis_port=redis_port,
            redis_db=redis_db,
            redis_password=redis_password,
            similarity_threshold=similarity_threshold,
            embedding_model=embedding_model,
            ttl_seconds=cache_ttl,
            enabled=cache_enabled
        )
    except Exception as e:
        logger.error(f"Failed to create semantic cache: {e}")
        # Return disabled cache as fallback
        return SemanticCache(enabled=False)


# Global cache instance (lazy initialization)
_cache_instance: Optional[SemanticCache] = None


def get_semantic_cache() -> SemanticCache:
    """Get or create global semantic cache instance"""
    global _cache_instance
    if _cache_instance is None:
        _cache_instance = create_semantic_cache()
    return _cache_instance
