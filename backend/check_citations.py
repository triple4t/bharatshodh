"""
Check if citations are being saved to MongoDB
"""
import asyncio
from database import get_database, connect_to_mongo

async def check_citations_in_db():
    await connect_to_mongo()
    db = get_database()
    
    print("=" * 60)
    print("Checking Citations in MongoDB")
    print("=" * 60)
    
    # Get the most recent assistant message with citations
    message = await db.messages.find_one(
        {"role": "assistant"},
        sort=[("timestamp", -1)]
    )
    
    if not message:
        print("\n❌ No assistant messages found!")
        return
    
    print(f"\n📄 Latest assistant message:")
    print(f"  Chat ID: {message.get('chat_id')}")
    print(f"  Timestamp: {message.get('timestamp')}")
    print(f"  Content preview: {message.get('content', '')[:100]}...")
    
    citations = message.get('citations')
    if citations:
        print(f"\n✅ CITATIONS FOUND: {len(citations)} citations in database")
        print(f"\n📋 First citation:")
        import json
        print(json.dumps(citations[0], indent=2, default=str))
    else:
        print(f"\n❌ NO CITATIONS in this message")
        print(f"\n📋 Message keys: {list(message.keys())}")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    asyncio.run(check_citations_in_db())
