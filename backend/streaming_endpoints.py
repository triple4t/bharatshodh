# ---------- Enterprise Streaming Document Ingestion Endpoints ----------

@app.post("/api/documents/upload-async", response_model=DocumentUploadResponse)
async def upload_document_async(
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload document and start background processing (non-blocking).
    
    Returns immediately with document ID. Frontend polls
    /api/documents/{doc_id}/status for progress updates.
    
    Handles PDFs of any size (300MB+, 1000+ pages) safely.
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.txt')):
            raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported")
        
        # Generate document ID
        doc_id = str(uuid.uuid4())
        
        # Save uploaded file
        doc_dir = os.path.join(settings.upload_dir, "documents")
        os.makedirs(doc_dir, exist_ok=True)
        
        file_path = os.path.join(doc_dir, f"{doc_id}_{file.filename}")
        
        # Stream file to disk (memory-safe for large files)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = os.path.getsize(file_path)
        logger.info(f"📁 Saved file: {file.filename} ({file_size / 1024 / 1024:.2f} MB)")
        
        # Start background processing (non-blocking!)
        background_processor.start_processing(
            doc_id=doc_id,
            file_path=file_path,
            uploaded_by=current_user["id"],
            doc_type=doc_type,
            filename=file.filename
        )
        
        logger.info(f"🚀 Background processing started for {doc_id}")
        
        return DocumentUploadResponse(
            message=f"Upload started for {file.filename}. Processing in background.",
            document=DocumentInfo(
                id=doc_id,
                filename=file.filename,
                upload_date=datetime.utcnow(),
                uploaded_by=current_user["id"],
                doc_type=doc_type,
                file_size=file_size,
                chunk_count=0,
                status=DocumentStatus.PROCESSING
            )
        )
        
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/documents/{doc_id}/status")
async def get_document_status(
    doc_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get processing status for a document.
    
    Frontend polls this endpoint to show progress:
    - uploaded
    - processing
    - partially_ready (first 20 pages searchable)
    - completed
    - failed
    """
    from database import get_database
    
    db = get_database()
    
    # Get progress tracking
    progress = await db.document_progress.find_one({"doc_id": doc_id})
    
    if not progress:
        # Check if document exists without progress tracking (old upload)
        doc = await db.documents.find_one({"_id": doc_id})
        if doc:
            return {
                "doc_id": doc_id,
                "status": doc.get("status", DocumentStatus.COMPLETED),
                "total_pages": None,
                "pages_processed": None,
                "chunks_created": doc.get("chunk_count", 0),
                "message": "Document processed (legacy upload)"
            }
        
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Return progress
    return {
        "doc_id": progress["doc_id"],
        "status": progress["status"],
        "total_pages": progress.get("total_pages"),
        "pages_processed": progress.get("pages_processed", 0),
        "chunks_created": progress.get("chunks_created", 0),
        "error_message": progress.get("error_message"),
        "started_at": progress["started_at"],
        "updated_at": progress["updated_at"],
        "completed_at": progress.get("completed_at"),
        "progress_percentage": int((progress.get("pages_processed", 0) / progress.get("total_pages", 1)) * 100) if progress.get("total_pages") else 0
    }


@app.get("/api/documents/processing-status")
async def get_all_processing_status(current_user: dict = Depends(get_current_user)):
    """
    Get status of all currently processing documents.
    
    Useful for admin dashboard to see active background tasks.
    """
    active_tasks = background_processor.get_active_tasks()
    
    from database import get_database
    db = get_database()
    
    # Get progress for active tasks
    status_list = []
    for doc_id in active_tasks.keys():
        progress = await db.document_progress.find_one({"doc_id": doc_id})
        if progress:
            status_list.append({
                "doc_id": doc_id,
                "status": progress["status"],
                "filename": progress.get("filename", "Unknown"),
                "pages_processed": progress.get("pages_processed", 0),
                "total_pages": progress.get("total_pages"),
                "chunks_created": progress.get("chunks_created", 0)
            })
    
    return {
        "active_count": len(active_tasks),
        "processing_documents": status_list
    }
