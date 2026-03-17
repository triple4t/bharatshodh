"""
Cleanup script to fix FAISS-MongoDB mismatches
"""
import asyncio
from database import get_database, connect_to_mongo
from services.vector_index import VectorIndexManager

async def cleanup_orphaned_faiss_entries():
    await connect_to_mongo()
    db = get_database()
    
    print("=" * 60)
    print("FAISS-MongoDB Sync Cleanup")
    print("=" * 60)
    
    # Load FAISS index
    index_manager = VectorIndexManager()
    index_manager.load()
    
    # Get all doc IDs from MongoDB
    mongo_doc_ids = set()
    async for doc in db.documents.find({}, {'_id': 1}):
        mongo_doc_ids.add(str(doc['_id']))
    
    print(f"\n📊 MongoDB documents: {len(mongo_doc_ids)}")
    print(f"📊 FAISS documents: {len(index_manager.doc_to_chunks)}")
    
    # Find orphaned entries in FAISS
    orphaned = []
    for doc_id in index_manager.doc_to_chunks.keys():
        if doc_id not in mongo_doc_ids:
            orphaned.append(doc_id)
    
    if not orphaned:
        print("\n✅ No orphaned entries found!")
        return
    
    print(f"\n⚠️ Found {len(orphaned)} orphaned FAISS entries:")
    for doc_id in orphaned:
        chunk_count = len(index_manager.doc_to_chunks[doc_id])
        print(f"  - {doc_id} ({chunk_count} chunks)")
    
    # Remove orphaned entries
    print(f"\n🧹 Cleaning up orphaned entries...")
    for doc_id in orphaned:
        index_manager.remove_document(doc_id)
        print(f"  ✅ Removed {doc_id}")
    
    # Save cleaned index
    index_manager.save()
    print(f"\n💾 FAISS index saved")
    
    print(f"\n✅ Cleanup complete!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(cleanup_orphaned_faiss_entries())
