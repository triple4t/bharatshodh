import os
import uuid
import logging
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime
import numpy as np
from rank_bm25 import BM25Okapi
import re  # For chapter detection

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from docx import Document as DocxDocument
from sentence_transformers import SentenceTransformer

from database import get_database
from config import settings

logger = logging.getLogger(__name__)


def detect_chapter(text: str) -> Optional[str]:
    """
    Detect chapter/section titles from text using pattern matching.
    
    Patterns recognized:
    - "Chapter X: Title" or "Chapter X – Title"
    - "Section X(X): Title" or "Section X.X Title"
    - Standalone titles like "Entitlement", "Introduction", etc.
    
    Args:
        text: Text to scan for chapter titles (usually first 1000 chars)
    
    Returns:
        Chapter title if found, None otherwise
    """
    # Check first 1000 characters only (chapters usually appear early)
    search_text = text[:1000]
    
    patterns = [
        # "Chapter 5: Title" or "Chapter 5 – Title"
        r'(?:Chapter|CHAPTER)\s+(\d+)[:\s–-]+([^\n]{3,100})',
        # "Section 5(2): Title" or "Section 5.2 Title"
        r'(?:Section|SECTION)\s+(\d+(?:\(\d+\)|\.\d+)?)[:\s–-]+([^\n]{3,100})',
        # Standalone important titles (case-insensitive, must be on own line)
        r'^((?:Entitlement|Introduction|Conclusion|Overview|Summary|Definitions)[s]?)\s*$',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, search_text, re.IGNORECASE | re.MULTILINE)
        if match:
            # Return the full matched text, cleaned up
            chapter_text = match.group(0).strip()
            # Limit length
            if len(chapter_text) > 150:
                chapter_text = chapter_text[:147] + "..."
            return chapter_text
    
    return None


class DocumentService:
    """
    Document RAG service for handling document uploads, chunking, embedding, and retrieval.
    Leverages existing file_processor for file handling and semantic_cache for embeddings.
    """

    def __init__(self):
        self.db = None
        self.embedding_model = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        # Document storage directory
        self.doc_dir = os.path.join(
            getattr(settings, "upload_dir", "uploads"), "documents"
        )
        os.makedirs(self.doc_dir, exist_ok=True)

    def get_db(self):
        """Get database connection"""
        if self.db is None:
            self.db = get_database()
        return self.db

    def get_embedding_model(self):
        """Lazy load embedding model (same as semantic_cache)"""
        if self.embedding_model is None:
            model_name = getattr(settings, "semantic_cache_embedding_model", "all-MiniLM-L6-v2")
            logger.info(f"Loading embedding model: {model_name}")
            self.embedding_model = SentenceTransformer(model_name)
        return self.embedding_model

    def _compute_embedding(self, text: str) -> np.ndarray:
        """Compute embedding vector for text"""
        model = self.get_embedding_model()
        return model.encode(text, convert_to_numpy=True)

    async def _extract_text_from_file(self, file_path: str, filename: str) -> str:
        """
        Extract text from uploaded file using existing file_processor logic.
        Supports PDF, DOCX, TXT files.
        """
        ext = os.path.splitext(filename)[1].lower()

        try:
            if ext == ".pdf":
                loader = PyPDFLoader(file_path)
                documents = loader.load()
                full_text = "\n\n".join(doc.page_content for doc in documents)
                return full_text

            elif ext == ".docx":
                # Use python-docx (same as file_processor)
                doc = DocxDocument(file_path)
                paras = [p.text.strip() for p in doc.paragraphs if p.text and p.text.strip()]
                full_text = "\n".join(paras)

                # Try tables if body is empty
                if not full_text:
                    table_lines = []
                    for tbl in doc.tables:
                        for row in tbl.rows:
                            cells = [c.text.strip() for c in row.cells if c.text and c.text.strip()]
                            if cells:
                                table_lines.append(" | ".join(cells))
                    full_text = "\n".join(table_lines)

                return full_text

            elif ext == ".txt":
                try:
                    loader = TextLoader(file_path, encoding="utf-8", autodetect_encoding=True, errors="ignore")
                except TypeError:
                    loader = TextLoader(file_path, encoding="utf-8")
                documents = loader.load()
                return documents[0].page_content if documents else ""

            else:
                raise ValueError(f"Unsupported file type: {ext}")

        except Exception as e:
            logger.error(f"Error extracting text from {filename}: {e}")
            raise

    async def _extract_pdf_with_metadata(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Extract text from PDF with page numbers and chapter detection.
        
        Returns:
            List of dicts with: {'text': str, 'page': int, 'chapter': Optional[str]}
        """
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        
        pages_with_metadata = []
        current_chapter = None
        
        for doc in documents:
            page_num = doc.metadata.get('page', 0) + 1  # pages are 0-indexed, make 1-indexed
            text = doc.page_content
            
            # Try to detect chapter from this page
            detected_chapter = detect_chapter(text)
            if detected_chapter:
                current_chapter = detected_chapter
                logger.info(f"Detected chapter on page {page_num}: {detected_chapter}")
            
            pages_with_metadata.append({
                'text': text,
                'page': page_num,
                'chapter': current_chapter
            })
        
        return pages_with_metadata

    async def upload_document(
        self,
        file_path: str,
        filename: str,
        uploaded_by: str,
        doc_type: str  # 'admin' or 'user'
    ) -> Dict[str, Any]:
        """
        Upload and process a document for RAG.

        Args:
            file_path: Path to uploaded file
            filename: Original filename
            uploaded_by: User ID or Admin ID
            doc_type: 'admin' or 'user'

        Returns:
            Document info dict
        """
        try:
            # Generate unique document ID
            doc_id = str(uuid.uuid4())

            # Move file to documents directory
            ext = os.path.splitext(filename)[1].lower()
            stored_filename = f"{doc_id}{ext}"
            stored_path = os.path.join(self.doc_dir, stored_filename)

            # Copy file
            import shutil
            shutil.copy2(file_path, stored_path)

            # Extract text (with metadata for PDFs)
            logger.info(f"Extracting text from {filename}...")
            ext = os.path.splitext(filename)[1].lower()
            
            # For PDFs, extract with page metadata
            if ext == ".pdf":
                pages_metadata = await self._extract_pdf_with_metadata(stored_path)
                full_text = "\n\n".join(p['text'] for p in pages_metadata)
            else:
                # For non-PDFs, use regular extraction
                full_text = await self._extract_text_from_file(stored_path, filename)
                pages_metadata = None  # No page metadata for DOCX/TXT

            if not full_text or len(full_text.strip()) < 10:
                raise ValueError("Document appears to be empty or unreadable")

            # Chunk the text
            logger.info(f"Chunking document {filename}...")
            chunks = self.text_splitter.split_text(full_text)
            logger.info(f"Created {len(chunks)} chunks from {filename}")

            # Generate embeddings for each chunk with page/chapter metadata
            logger.info(f"Generating embeddings for {len(chunks)} chunks...")
            chunk_data = []
            
            # Track position in full_text to map chunks to pages
            chunk_position = 0
            
            for idx, chunk_text in enumerate(chunks):
                embedding = self._compute_embedding(chunk_text)
                
                # Find page and chapter for this chunk (for PDFs only)
                page_start = None
                page_end = None
                chapter = None
                
                if pages_metadata and ext == ".pdf":
                    # Find which page(s) this chunk belongs to
                    char_count =0
                    for page_info in pages_metadata:
                        page_text_len = len(page_info['text'])
                        
                        # Check if chunk overlaps with this page
                        if chunk_position < char_count + page_text_len:
                            if page_start is None:
                                page_start = page_info['page']
                                chapter = page_info['chapter']
                            page_end = page_info['page']
                        
                        char_count += page_text_len + 2  # +2 for \n\n separator
                        
                        if char_count > chunk_position + len(chunk_text):
                            break
                
                chunk_data.append({
                    "chunk_id": f"{doc_id}_chunk_{idx}",
                    "text": chunk_text,
                    "embedding": embedding.tolist(),
                    "chunk_index": idx,
                    "page_start": page_start,         # NEW
                    "page_end": page_end,             # NEW
                    "chapter": chapter                # NEW
                })
                
                chunk_position += len(chunk_text)

            # Store in database
            db = self.get_db()
            file_size = os.path.getsize(stored_path)

            doc_record = {
                "_id": doc_id,
                "filename": filename,
                "upload_date": datetime.utcnow(),
                "uploaded_by": uploaded_by,
                "doc_type": doc_type,
                "file_path": stored_path,
                "file_size": file_size,
                "chunk_count": len(chunks),
                "chunks": chunk_data
            }

            await db.documents.insert_one(doc_record)
            logger.info(f"Document {filename} uploaded successfully with {len(chunks)} chunks")

            return {
                "id": doc_id,
                "filename": filename,
                "upload_date": doc_record["upload_date"],
                "uploaded_by": uploaded_by,
                "doc_type": doc_type,
                "file_size": file_size,
                "chunk_count": len(chunks)
            }

        except Exception as e:
            logger.error(f"Error uploading document {filename}: {e}")
            # Clean up file if exists
            if os.path.exists(stored_path):
                os.remove(stored_path)
            raise

    async def get_admin_documents(self) -> List[Dict[str, Any]]:
        """Get all admin-uploaded documents"""
        db = self.get_db()
        cursor = db.documents.find({"doc_type": "admin"}, {"chunks": 0})  # Exclude chunks
        docs = []
        async for doc in cursor:
            docs.append({
                "id": doc["_id"],
                "filename": doc["filename"],
                "upload_date": doc["upload_date"],
                "uploaded_by": doc["uploaded_by"],
                "doc_type": doc["doc_type"],
                "file_size": doc["file_size"],
                "chunk_count": doc["chunk_count"]
            })
        return docs

    async def get_user_documents(self, user_id: str) -> List[Dict[str, Any]]:
        """Get documents uploaded by a specific user"""
        db = self.get_db()
        cursor = db.documents.find(
            {"doc_type": "user", "uploaded_by": user_id},
            {"chunks": 0}  # Exclude chunks
        )
        docs = []
        async for doc in cursor:
            docs.append({
                "id": doc["_id"],
                "filename": doc["filename"],
                "upload_date": doc["upload_date"],
                "uploaded_by": doc["uploaded_by"],
                "doc_type": doc["doc_type"],
                "file_size": doc["file_size"],
                "chunk_count": doc["chunk_count"]
            })
        return docs

    async def delete_document(self, doc_id: str, user_id: str = None, is_admin: bool = False) -> bool:
        """
        Delete a document.

        Args:
            doc_id: Document ID
            user_id: User ID (required if not admin)
            is_admin: Whether requester is admin

        Returns:
            True if deleted, False otherwise
        """
        db = self.get_db()

        # Build query based on permissions
        if is_admin:
            query = {"_id": doc_id}
        else:
            # Users can only delete their own documents
            query = {"_id": doc_id, "doc_type": "user", "uploaded_by": user_id}

        doc = await db.documents.find_one(query)
        if not doc:
            return False

        # Delete file from disk
        file_path = doc.get("file_path")
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                logger.warning(f"Failed to delete file {file_path}: {e}")

        # Delete from database
        result = await db.documents.delete_one({"_id": doc_id})
        return result.deleted_count > 0

    async def retrieve_relevant_chunks(
        self,
        query: str,
        user_id: str,
        use_admin_docs: bool = True,
        use_user_docs: bool = True,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant document chunks using semantic similarity.

        Args:
            query: User query
            user_id: User ID
            use_admin_docs: Whether to search admin documents
            use_user_docs: Whether to search user documents
            top_k: Number of top chunks to return

        Returns:
            List of relevant chunks with metadata
        """
        try:
            db = self.get_db()

            # Build document filter
            doc_filters = []
            if use_admin_docs:
                doc_filters.append({"doc_type": "admin"})
            if use_user_docs:
                doc_filters.append({"doc_type": "user", "uploaded_by": user_id})

            if not doc_filters:
                return []

            # Get query embedding
            query_embedding = self._compute_embedding(query)

            # Fetch all relevant documents
            cursor = db.documents.find(
                {"$or": doc_filters} if len(doc_filters) > 1 else doc_filters[0]
            )

            all_chunks = []
            async for doc in cursor:
                doc_id = doc["_id"]
                filename = doc["filename"]
                for chunk in doc.get("chunks", []):
                    chunk_embedding = np.array(chunk["embedding"])
                    # Calculate cosine similarity
                    similarity = np.dot(query_embedding, chunk_embedding) / (
                        np.linalg.norm(query_embedding) * np.linalg.norm(chunk_embedding)
                    )
                    all_chunks.append({
                        "doc_id": doc_id,
                        "filename": filename,
                        "chunk_id": chunk["chunk_id"],
                        "text": chunk["text"],
                        "similarity": float(similarity),
                        "chunk_index": chunk["chunk_index"],
                        "page_start": chunk.get("page_start"),      # NEW: Include page metadata
                        "page_end": chunk.get("page_end"),          # NEW: Include page metadata
                        "chapter": chunk.get("chapter")             # NEW: Include chapter metadata
                    })

            # Sort by similarity and get top_k
            all_chunks.sort(key=lambda x: x["similarity"], reverse=True)
            top_chunks = all_chunks[:top_k]

            logger.info(f"Retrieved {len(top_chunks)} relevant chunks for query: '{query[:50]}...'")
            return top_chunks

        except Exception as e:
            logger.error(f"Error retrieving relevant chunks: {e}")
            return []

    def _tokenize(self, text: str) -> List[str]:
        """Simple tokenization for BM25 (lowercase and split)."""
        return text.lower().split()

    async def _bm25_search(
        self,
        query: str,
        user_id: str,
        use_admin_docs: bool = True,
        use_user_docs: bool = True,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Perform BM25 keyword search on document chunks.
        
        Args:
            query: User query
            user_id: User ID
            use_admin_docs: Whether to search admin documents
            use_user_docs: Whether to search user documents
            top_k: Number of top chunks to return
            
        Returns:
            List of chunks with BM25 scores
        """
        try:
            db = self.get_db()

            # Build document filter
            doc_filters = []
            if use_admin_docs:
                doc_filters.append({"doc_type": "admin"})
            if use_user_docs:
                doc_filters.append({"doc_type": "user", "uploaded_by": user_id})

            if not doc_filters:
                return []

            # Fetch all relevant documents and their chunks
            cursor = db.documents.find(
                {"$or": doc_filters} if len(doc_filters) > 1 else doc_filters[0]
            )

            all_chunks = []
            corpus = []
            
            async for doc in cursor:
                doc_id = doc["_id"]
                filename = doc["filename"]
                for chunk in doc.get("chunks", []):
                    chunk_text = chunk["text"]
                    all_chunks.append({
                        "doc_id": doc_id,
                        "filename": filename,
                        "chunk_id": chunk["chunk_id"],
                        "text": chunk_text,
                        "chunk_index": chunk["chunk_index"],
                        "page_start": chunk.get("page_start"),      # NEW: Include page metadata
                        "page_end": chunk.get("page_end"),          # NEW: Include page metadata
                        "chapter": chunk.get("chapter")             # NEW: Include chapter metadata
                    })
                    corpus.append(self._tokenize(chunk_text))

            if not corpus:
                return []

            # Build BM25 index
            bm25 = BM25Okapi(corpus)
            
            # Get BM25 scores
            tokenized_query = self._tokenize(query)
            scores = bm25.get_scores(tokenized_query)

            # Attach scores to chunks
            for i, chunk in enumerate(all_chunks):
                chunk["bm25_score"] = float(scores[i])

            # Sort by BM25 score and get top_k
            all_chunks.sort(key=lambda x: x["bm25_score"], reverse=True)
            top_chunks = all_chunks[:top_k]

            logger.info(f"BM25 retrieved {len(top_chunks)} chunks for query: '{query[:50]}...'")
            return top_chunks

        except Exception as e:
            logger.error(f"Error in BM25 search: {e}")
            return []

    async def retrieve_relevant_chunks_hybrid(
        self,
        query: str,
        user_id: str,
        use_admin_docs: bool = True,
        use_user_docs: bool = True,
        top_k: int = 5,
        semantic_weight: float = 0.7,
        bm25_weight: float = 0.3
    ) -> Dict[str, Any]:
        """
        Hybrid search combining semantic embeddings and BM25 keyword search.
        
        Args:
            query: User query
            user_id: User ID
            use_admin_docs: Whether to search admin documents
            use_user_docs: Whether to search user documents
            top_k: Number of top chunks to return
            semantic_weight: Weight for semantic similarity (default 0.7)
            bm25_weight: Weight for BM25 score (default 0.3)
            
        Returns:
            Dict with 'context' string and 'citations' list
        """
        try:
            # Get semantic search results
            semantic_results = await self.retrieve_relevant_chunks(
                query=query,
                user_id=user_id,
                use_admin_docs=use_admin_docs,
                use_user_docs=use_user_docs,
                top_k=top_k * 2  # Get more to combine with BM25
            )

            # Get BM25 search results
            bm25_results = await self._bm25_search(
                query=query,
                user_id=user_id,
                use_admin_docs=use_admin_docs,
                use_user_docs=use_user_docs,
                top_k=top_k * 2
            )

            # Combine results using chunk_id as key
            combined_scores = {}
            
            # Normalize semantic scores
            if semantic_results:
                semantic_scores = [r["similarity"] for r in semantic_results]
                min_sem = min(semantic_scores)
                max_sem = max(semantic_scores)
                
                for result in semantic_results:
                    chunk_id = result["chunk_id"]
                    # Normalize to [0, 1]
                    norm_score = (result["similarity"] - min_sem) / (max_sem - min_sem) if max_sem > min_sem else 1.0
                    
                    combined_scores[chunk_id] = {
                        "chunk": result,
                        "semantic_score": norm_score,
                        "bm25_score": 0.0
                    }

            # Normalize BM25 scores
            if bm25_results:
                bm25_scores = [r["bm25_score"] for r in bm25_results]
                min_bm25 = min(bm25_scores)
                max_bm25 = max(bm25_scores)
                
                for result in bm25_results:
                    chunk_id = result["chunk_id"]
                    # Normalize to [0, 1]
                    norm_score = (result["bm25_score"] - min_bm25) / (max_bm25 - min_bm25) if max_bm25 > min_bm25 else 1.0
                    
                    if chunk_id in combined_scores:
                        combined_scores[chunk_id]["bm25_score"] = norm_score
                    else:
                        combined_scores[chunk_id] = {
                            "chunk": result,
                            "semantic_score": 0.0,
                            "bm25_score": norm_score
                        }

            # Calculate final hybrid scores
            final_results = []
            for chunk_id, scores in combined_scores.items():
                hybrid_score = (semantic_weight * scores["semantic_score"]) + (bm25_weight * scores["bm25_score"])
                logger.info(f"Chunk: {chunk_id[:30]}... | Semantic: {scores['semantic_score']:.3f} | BM25: {scores['bm25_score']:.3f} | Hybrid: {hybrid_score:.3f}")
                chunk = scores["chunk"]
                chunk["hybrid_score"] = hybrid_score
                final_results.append(chunk)

            # Sort by hybrid score and get top_k
            final_results.sort(key=lambda x: x["hybrid_score"], reverse=True)
            top_results = final_results[:top_k]

            # Build citations with page and chapter metadata
            citations = []
            for result in top_results:
                citation = {
                    "doc_id": result["doc_id"],
                    "filename": result["filename"],
                    "chunk_text": result["text"],
                    "relevance_score": result["hybrid_score"],
                    "chunk_index": result["chunk_index"],
                    "page_start": result.get("page_start"),
                    "page_end": result.get("page_end"),
                    "chapter": result.get("chapter")
                }
                citations.append(citation)
                
                # DEBUG: Log each citation's metadata
                logger.info(f"📄 Citation {len(citations)}: page_start={citation['page_start']}, page_end={citation['page_end']}, chapter={citation['chapter']}")
            
            logger.info(f"✅ Built {len(citations)} citations with metadata")

            # Build context
            context = self.build_rag_context(top_results)

            logger.info(f"Hybrid search retrieved {len(top_results)} chunks with citations")
            
            return {
                "context": context,
                "citations": citations
            }

        except Exception as e:
            logger.error(f"Error in hybrid search: {e}")
            return {
                "context": "",
                "citations": []
            }

    def build_rag_context(self, chunks: List[Dict[str, Any]]) -> str:
        """
        Build context string from retrieved chunks for RAG prompt with numbered citations.

        Args:
            chunks: List of relevant chunks

        Returns:
            Formatted context string with numbered references [1], [2], etc.
        """
        if not chunks:
            return ""

        context_parts = ["Here are relevant excerpts from the documents:\n"]
        for idx, chunk in enumerate(chunks, 1):
            # Format chapter info
            chapter_info = chunk.get('chapter') or 'Not specified'
            
            # Format page info
            page_start = chunk.get('page_start')
            if page_start:
                page_info = f"Page {page_start}"
                page_end = chunk.get('page_end')
                if page_end and page_end != page_start:
                    page_info += f"-{page_end}"
            else:
                page_info = "Page not specified"
            
            context_parts.append(
                f"\n[{idx}] Source: {chunk['filename']}\n"
                f"    Chapter: {chapter_info}\n"
                f"    {page_info}\n"
                f"    {chunk['text']}\n"
            )

        return "\n".join(context_parts)


# Export singleton instance
document_service = DocumentService()
