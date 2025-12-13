

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
from config import settings
import logging

logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None
    database = None

mongodb = MongoDB()

async def connect_to_mongo():
    """Create database connection and ensure indexes."""
    try:
        mongodb.client = AsyncIOMotorClient(settings.mongodb_url)
        mongodb.database = mongodb.client[settings.mongodb_database]
        db = mongodb.database

        # ----- users -----
        await db.users.create_index([("email", ASCENDING)], unique=True)
        await db.users.create_index([("created_at", DESCENDING)])

        # ----- chats -----
        await db.chats.create_index([("owner_id", ASCENDING), ("updated_at", DESCENDING)])
        await db.chats.create_index([("created_at", ASCENDING)])

        # ----- messages -----
        await db.messages.create_index([("owner_id", ASCENDING), ("chat_id", ASCENDING), ("timestamp", ASCENDING)])
        await db.messages.create_index([("chat_id", ASCENDING), ("timestamp", ASCENDING)])

        # ----- sessions -----
        await db.sessions.create_index([("session_id", ASCENDING)], unique=True)

        logger.info("Connected to MongoDB and ensured indexes.")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if mongodb.client is not None:
        mongodb.client.close()
        logger.info("Disconnected from MongoDB")

def get_database():
    return mongodb.database
