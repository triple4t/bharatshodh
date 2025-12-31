"""
FAISS Vector Index Manager for efficient similarity search.

Provides fast approximate nearest neighbor search using HNSW algorithm
for large-scale document retrieval (10,000+ PDFs).
"""

import faiss
import numpy as np
import pickle
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


class VectorIndexManager:
    """
    Manages FAISS vector index for fast similarity search.
    
    Uses HNSW (Hierarchical Navigable Small World) algorithm for
    sub-linear search complexity: O(log N) instead of O(N).
    """
    
    def __init__(self, index_dir: str = 'data/faiss_index', dimension: int = 384):
        """
        Initialize vector index manager.
        
        Args:
            index_dir: Directory to store FAISS index files
            dimension: Embedding vector dimension (384 for all-MiniLM-L6-v2)
        """
        self.index_dir = Path(index_dir)
        self.index_dir.mkdir(parents=True, exist_ok=True)
        self.dimension = dimension
        self.index: Optional[faiss.Index] = None
        self.chunk_ids: List[str] = []  # Maps FAISS position → chunk_id
        self.doc_to_chunks: Dict[str, List[int]] = {}  # doc_id → [faiss_indices]
        
    def initialize_index(self):
        """
        Create HNSW index for fast approximate search.
        
        HNSW parameters:
        - M=32: Number of bi-directional links (higher = more accurate but slower)
        - efConstruction=40: Size of dynamic candidate list during construction
        - efSearch=16: Size of dynamic candidate list during search
        """
        logger.info(f"Initializing FAISS HNSW index (dimension={self.dimension})")
        
        # HNSW is optimal for >10k vectors
        # For <10k vectors, IndexFlatIP would be faster but less scalable
        self.index = faiss.IndexHNSWFlat(self.dimension, 32)
        self.index.hnsw.efConstruction = 40
        self.index.hnsw.efSearch = 16
        
        logger.info("FAISS index initialized successfully")
        
    def add_vectors(self, embeddings: List[List[float]], chunk_ids: List[str], doc_id: str):
        """
        Add embeddings to the index.
        
        Args:
            embeddings: List of embedding vectors
            chunk_ids: List of chunk IDs corresponding to embeddings
            doc_id: Document ID these chunks belong to
        """
        if self.index is None:
            self.initialize_index()
            
        # Convert to numpy array with float32 (FAISS requirement)
        embeddings_np = np.array(embeddings, dtype='float32')
        
        # Normalize vectors for cosine similarity
        faiss.normalize_L2(embeddings_np)
        
        # Track starting position for this batch
        start_idx = len(self.chunk_ids)
        
        # Add to index
        self.index.add(embeddings_np)
        self.chunk_ids.extend(chunk_ids)
        
        # Track which chunks belong to this document
        indices = list(range(start_idx, start_idx + len(chunk_ids)))
        if doc_id in self.doc_to_chunks:
            self.doc_to_chunks[doc_id].extend(indices)
        else:
            self.doc_to_chunks[doc_id] = indices
        
        logger.info(f"Added {len(embeddings)} vectors to index (total: {len(self.chunk_ids)})")
        
    def search(self, query_embedding: np.ndarray, top_k: int = 50) -> List[Dict[str, Any]]:
        """
        Fast vector similarity search.
        
        Args:
            query_embedding: Query embedding vector
            top_k: Number of top results to return
            
        Returns:
            List of dicts with chunk_id, distance, and similarity score
        """
        if self.index is None or len(self.chunk_ids) == 0:
            logger.warning("Index is empty, returning no results")
            return []
            
        # Normalize query vector
        query_np = np.array([query_embedding], dtype='float32')
        faiss.normalize_L2(query_np)
        
        # Search
        distances, indices = self.index.search(query_np, min(top_k, len(self.chunk_ids)))
        
        results = []
        for idx, dist in zip(indices[0], distances[0]):
            if idx >= 0 and idx < len(self.chunk_ids):  # Valid index
                # Convert L2 distance to similarity score
                # After normalization, L2 distance relates to cosine similarity
                similarity = 1 / (1 + float(dist))
                
                results.append({
                    'chunk_id': self.chunk_ids[idx],
                    'distance': float(dist),
                    'similarity': similarity
                })
        
        return results
        
    def remove_document(self, doc_id: str):
        """
        Remove all chunks belonging to a document from the index.
        
        Note: FAISS doesn't support efficient deletion, so we rebuild the index.
        For production with frequent deletions, consider using a deletion bitmap.
        """
        if doc_id not in self.doc_to_chunks:
            return
            
        # Get indices to keep (all except this document)
        indices_to_remove = set(self.doc_to_chunks[doc_id])
        indices_to_keep = [i for i in range(len(self.chunk_ids)) if i not in indices_to_remove]
        
        # Rebuild index with remaining vectors
        if len(indices_to_keep) > 0:
            # Extract vectors
            vectors = np.array([self.index.reconstruct(i) for i in indices_to_keep], dtype='float32')
            new_chunk_ids = [self.chunk_ids[i] for i in indices_to_keep]
            
            # Rebuild
            self.initialize_index()
            self.index.add(vectors)
            self.chunk_ids = new_chunk_ids
            
            # Rebuild doc_to_chunks mapping
            new_mapping = {}
            for other_doc_id, doc_indices in self.doc_to_chunks.items():
                if other_doc_id != doc_id:
                    # Remap indices
                    new_indices = []
                    for old_idx in doc_indices:
                        if old_idx in indices_to_keep:
                            new_idx = indices_to_keep.index(old_idx)
                            new_indices.append(new_idx)
                    if new_indices:
                        new_mapping[other_doc_id] = new_indices
            
            self.doc_to_chunks = new_mapping
        else:
            # No vectors left
            self.initialize_index()
            self.chunk_ids = []
            self.doc_to_chunks = {}
            
        logger.info(f"Removed document {doc_id} from index")
        
    def save(self):
        """Persist index to disk."""
        try:
            index_path = self.index_dir / 'faiss.index'
            metadata_path = self.index_dir / 'metadata.pkl'
            
            if self.index is not None:
                faiss.write_index(self.index, str(index_path))
                
            with open(metadata_path, 'wb') as f:
                pickle.dump({
                    'chunk_ids': self.chunk_ids,
                    'doc_to_chunks': self.doc_to_chunks,
                    'dimension': self.dimension
                }, f)
                
            logger.info(f"FAISS index saved to {index_path}")
            
        except Exception as e:
            logger.error(f"Error saving FAISS index: {e}")
            
    def load(self) -> bool:
        """
        Load index from disk.
        
        Returns:
            True if loaded successfully, False otherwise
        """
        try:
            index_path = self.index_dir / 'faiss.index'
            metadata_path = self.index_dir / 'metadata.pkl'
            
            if not index_path.exists() or not metadata_path.exists():
                logger.info("No existing FAISS index found")
                return False
                
            # Load index
            self.index = faiss.read_index(str(index_path))
            
            # Load metadata
            with open(metadata_path, 'rb') as f:
                metadata = pickle.load(f)
                self.chunk_ids = metadata['chunk_ids']
                self.doc_to_chunks = metadata['doc_to_chunks']
                self.dimension = metadata['dimension']
                
            logger.info(f"FAISS index loaded: {len(self.chunk_ids)} vectors")
            return True
            
        except Exception as e:
            logger.error(f"Error loading FAISS index: {e}")
            return False
            
    def get_stats(self) -> Dict[str, Any]:
        """Get index statistics."""
        return {
            'total_vectors': len(self.chunk_ids),
            'total_documents': len(self.doc_to_chunks),
            'index_type': 'HNSW' if self.index else None,
            'dimension': self.dimension
        }
