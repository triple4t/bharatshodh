"""
Background Document Processor for enterprise streaming ingestion.

Processes large PDFs (300MB+, 1000+ pages) asynchronously without blocking requests.
Features:
- Page-by-page streaming processing
- Incremental FAISS index updates
- Progress tracking  
- Partial availability (first 20 pages searchable immediately)
- Graceful error handling
"""

import asyncio
from typing import Optional, Dict
import logging
from datetime import datetime
import os

from .streaming_loader import StreamingPDFLoader
from .document_service import DocumentService
from models import DocumentStatus, DocumentProgress
from database import get_database

logger = logging.getLogger(__name__)


class BackgroundDocumentProcessor:
    """
    Asynchronously process large documents without blocking API requests.
    
    Processing Strategy:
    1. Create document record immediately in MongoDB
    2. First batch (20 pages) → Mark as PARTIALLY_READY
    3. Continue processing remaining pages in background
    4. Update FAISS index incrementally after each batch
    5. Save progress to MongoDB after each batch
    """
    
    def __init__(self):
        self.document_service = DocumentService()
        # Enable OCR for scanned/Hindi PDFs
        try:
            self.streaming_loader = StreamingPDFLoader(batch_size=20, use_ocr=True, ocr_lang='hin+eng')
        except:
            # Fallback if OCR not available
            self.streaming_loader = StreamingPDFLoader(batch_size=20, use_ocr=False)
        self.active_tasks: Dict[str, asyncio.Task] = {}
        
    async def process_document_async(
        self,
        doc_id: str,
        file_path: str,
        uploaded_by: str,
        doc_type: str,
        filename: str
    ):
        """Process document in background with incremental updates."""
        db = get_database()
        
        try:
            # Get total pages
            total_pages = self.streaming_loader.get_total_pages(file_path)
            
            # Initialize progress tracking
            progress = DocumentProgress(
                doc_id=doc_id,
                status=DocumentStatus.PROCESSING,
                total_pages=total_pages,
                pages_processed=0,
                chunks_created=0,
                started_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            await db.document_progress.insert_one(progress.dict())
            
            # Create document record IMMEDIATELY (even before processing)
            doc_record = {
                "_id": doc_id,
                "filename": filename,
                "upload_date": datetime.utcnow(),
                "uploaded_by": uploaded_by,
                "doc_type": doc_type,
                "file_path": file_path,
                "file_size": os.path.getsize(file_path),
                "chunk_count": 0,
                "chunks": [],
                "status": DocumentStatus.PROCESSING
            }
            await db.documents.insert_one(doc_record)
            logger.info(f"📄 Document record created for {filename} ({total_pages} pages)")
            
            total_chunks = 0
            first_batch_done = False
            
            # Process in batches
            for batch_num, pages_batch in enumerate(
                self.streaming_loader.load_in_batches(file_path), start=1
            ):
                logger.info(f"📦 Processing batch {batch_num} ({len(pages_batch)} pages)")
                
                # Extract text from successful pages
                batch_texts = []
                for page_data in pages_batch:
                    if not page_data['error'] and page_data['text'].strip():
                        batch_texts.append(page_data['text'])
                        if page_data.get('ocr_used'):
                            logger.info(f"✅ OCR extracted text from page {page_data['page_num']}")
                    elif page_data['error']:
                        logger.warning(f"⚠️ Skipping page {page_data['page_num']}: {page_data['error']}")
                
                if not batch_texts:
                    logger.warning(f"Batch {batch_num} has no text, continuing...")
                    continue
                
                batch_text = "\n\n".join(batch_texts)
                
                # Chunk and embed
                chunks = self.document_service.text_splitter.split_text(batch_text)
                
                # Generate embeddings
                chunk_data = []
                for idx, chunk_text in enumerate(chunks):
                    try:
                        embedding = self.document_service._compute_embedding(chunk_text)
                        chunk_data.append({
                            "chunk_id": f"{doc_id}_chunk_{total_chunks + idx}",
                            "text": chunk_text,
                            "embedding": embedding.tolist(),
                            "chunk_index": total_chunks + idx,
                            "page_start": pages_batch[0]['page_num'],
                            "page_end": pages_batch[-1]['page_num'],
                            "chapter": None
                        })
                    except Exception as e:
                        logger.error(f"Error embedding chunk {idx}: {e}")
                        continue
                
                if not chunk_data:
                    continue
                
                # Add to FAISS (incremental)
                try:
                    embeddings_for_faiss = [c["embedding"] for c in chunk_data]
                    chunk_ids = [c["chunk_id"] for c in chunk_data]
                    self.document_service.vector_index.add_vectors(
                        embeddings_for_faiss, chunk_ids, doc_id
                    )
                    logger.info(f"✅ Added {len(chunk_ids)} vectors to FAISS")
                except Exception as e:
                    logger.error(f"Error adding to FAISS: {e}")
                
                # Remove embeddings before MongoDB save
                for chunk in chunk_data:
                    del chunk["embedding"]
                
                # Append chunks to document
                await db.documents.update_one(
                    {"_id": doc_id},
                    {
                        "$push": {"chunks": {"$each": chunk_data}},
                        "$set": {"chunk_count": total_chunks + len(chunk_data)}
                    }
                )
                
                # Update progress
                total_chunks += len(chunk_data)
                pages_processed = pages_batch[-1]['page_num']
                new_status = DocumentStatus.PARTIALLY_READY if not first_batch_done else DocumentStatus.PROCESSING
                
                await db.document_progress.update_one(
                    {"doc_id": doc_id},
                    {
                        "$set": {
                            "pages_processed": pages_processed,
                            "chunks_created": total_chunks,
                            "updated_at": datetime.utcnow(),
                            "status": new_status
                        }
                    }
                )
                
                # Save FAISS after each batch
                try:
                    self.document_service.vector_index.save()
                except Exception as e:
                    logger.error(f"Error saving FAISS: {e}")
                
                first_batch_done = True
                logger.info(f"✅ Batch {batch_num}: {pages_processed}/{total_pages} pages, {total_chunks} chunks")
                
                await asyncio.sleep(0.1)
            
            # Mark as completed
            await db.document_progress.update_one(
                {"doc_id": doc_id},
                {"$set": {
                    "status": DocumentStatus.COMPLETED,
                    "completed_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }}
            )
            
            await db.documents.update_one(
                {"_id": doc_id},
                {"$set": {"status": DocumentStatus.COMPLETED}}
            )
            
            logger.info(f"🎉 Document {filename} completed: {total_chunks} chunks")
            
        except Exception as e:
            logger.error(f"❌ Error processing {doc_id}: {e}")
            import traceback
            traceback.print_exc()
            
            # Mark as failed
            try:
                await db.document_progress.update_one(
                    {"doc_id": doc_id},
                    {"$set": {
                        "status": DocumentStatus.FAILED,
                        "error_message": str(e),
                        "updated_at": datetime.utcnow()
                    }}
                )
                
                await db.documents.update_one(
                    {"_id": doc_id},
                    {"$set": {"status": DocumentStatus.FAILED}}
                )
            except Exception as update_error:
                logger.error(f"Error updating failure status: {update_error}")
                
        finally:
            if doc_id in self.active_tasks:
                del self.active_tasks[doc_id]
    
    def start_processing(
        self,
        doc_id: str,
        file_path: str,
        uploaded_by: str,
        doc_type: str,
        filename: str
    ) -> asyncio.Task:
        """Start background processing (non-blocking)."""
        task = asyncio.create_task(
            self.process_document_async(
                doc_id=doc_id,
                file_path=file_path,
                uploaded_by=uploaded_by,
                doc_type=doc_type,
                filename=filename
            )
        )
        
        self.active_tasks[doc_id] = task
        logger.info(f"🚀 Started background processing for {doc_id}")
        return task
    
    def get_active_tasks(self) -> Dict[str, asyncio.Task]:
        """Get currently running tasks."""
        return self.active_tasks


# Global processor instance
background_processor = BackgroundDocumentProcessor()
