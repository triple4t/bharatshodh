# Semantic Caching - Quick Start Guide

Get semantic caching running in 5 minutes!

## Prerequisites

- Python 3.8+
- Your existing chatbot backend working

## Step 1: Install Dependencies (2 min)

```bash
cd backend
pip install -r requirements-semantic-cache.txt
```

This installs:
- Redis client
- Sentence transformers for embeddings

## Step 2: Start Redis (1 min)

### Using Docker (Easiest)

```bash
docker run -d --name redis-cache -p 6379:6379 redis:latest
```

### Or Install Locally

**Windows (WSL):**
```bash
sudo apt install redis-server
sudo service redis-server start
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

## Step 3: Configure (1 min)

Add to your `.env` file:

```env
# Minimal configuration
SEMANTIC_CACHE_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
```

Optional settings (with defaults):
```env
SEMANTIC_CACHE_THRESHOLD=0.95
SEMANTIC_CACHE_TTL_SECONDS=86400
REDIS_DB=0
```

## Step 4: Test Setup (1 min)

```bash
python setup_semantic_cache.py
```

This will:
- ✅ Check dependencies
- ✅ Test Redis connection
- ✅ Verify cache functionality
- ✅ Show statistics

## Step 5: Start Backend

```bash
uvicorn main:app --reload
```

Look for this in logs:
```
INFO: Semantic cache initialized successfully
INFO: Semantic caching enabled for AI service
```

## Done! 🎉

Your chatbot now has semantic caching!

## How to Verify It's Working

### Test via API

```bash
# First request (will call Azure OpenAI)
curl -X POST http://localhost:8000/api/chat/{chat_id}/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "What is Python?"}'

# Similar request (will use cache!)
curl -X POST http://localhost:8000/api/chat/{chat_id}/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Can you explain what Python is?"}'
```

### Check Cache Statistics

```bash
curl http://localhost:8000/api/cache/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "enabled": true,
  "total_entries": 5,
  "similarity_threshold": 0.95,
  "embedding_dim": 384
}
```

### Monitor Logs

Look for cache activity:
```
INFO: Cache HIT! Similarity: 0.97 | Query: 'What is Python?'
INFO: Cache MISS (low similarity 0.82, threshold 0.95)
```

## Common Issues

### Redis Connection Failed

```bash
# Test Redis
redis-cli ping
# Should return: PONG

# If not running:
docker start redis-cache
# or
sudo service redis-server start
```

### Cache Not Enabled

Check `.env` file:
```env
SEMANTIC_CACHE_ENABLED=true  # Make sure this is 'true'
```

### Dependencies Missing

```bash
pip install -r requirements-semantic-cache.txt
```

## Next Steps

- Read [SEMANTIC_CACHE_README.md](SEMANTIC_CACHE_README.md) for full documentation
- Tune `SEMANTIC_CACHE_THRESHOLD` for your use case
- Monitor cache hit rates with `/api/cache/stats`
- Set up Redis persistence for production

## Disabling Cache

Temporarily:
```env
SEMANTIC_CACHE_ENABLED=false
```

Permanently:
```bash
pip uninstall redis sentence-transformers
```

## Need Help?

1. Run diagnostics: `python setup_semantic_cache.py`
2. Check logs for error messages
3. See [SEMANTIC_CACHE_README.md](SEMANTIC_CACHE_README.md) troubleshooting section

---

**That's it!** Your chatbot now has intelligent semantic caching with zero changes to existing functionality.
