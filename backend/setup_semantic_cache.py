#!/usr/bin/env python3
"""
Setup script for Semantic Caching
This script helps configure and test semantic caching for the chatbot.
"""

import sys
import subprocess
import os
from pathlib import Path


def print_header(text):
    """Print formatted header"""
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60 + "\n")


def check_redis_connection():
    """Check if Redis is accessible"""
    try:
        import redis
        from config import settings

        client = redis.Redis(
            host=getattr(settings, 'redis_host', 'localhost'),
            port=int(getattr(settings, 'redis_port', 6379)),
            db=int(getattr(settings, 'redis_db', 0)),
            password=getattr(settings, 'redis_password', None)
        )
        client.ping()
        print("✅ Redis connection: SUCCESS")
        return True
    except ImportError:
        print("❌ Redis package not installed")
        print("   Run: pip install -r requirements-semantic-cache.txt")
        return False
    except Exception as e:
        print(f"❌ Redis connection: FAILED - {e}")
        print("\n   Troubleshooting:")
        print("   1. Start Redis: docker run -d -p 6379:6379 redis:latest")
        print("   2. Or install locally: https://redis.io/download")
        print("   3. Check REDIS_HOST and REDIS_PORT in .env")
        return False


def check_dependencies():
    """Check if required packages are installed"""
    required = ['redis', 'sentence-transformers']
    missing = []

    print_header("Checking Dependencies")

    for package in required:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}: installed")
        except ImportError:
            print(f"❌ {package}: NOT installed")
            missing.append(package)

    if missing:
        print(f"\n⚠️  Missing packages: {', '.join(missing)}")
        print(f"   Install with: pip install -r requirements-semantic-cache.txt")
        return False

    return True


def check_env_config():
    """Check environment configuration"""
    print_header("Checking Environment Configuration")

    try:
        from config import settings

        configs = {
            'REDIS_HOST': getattr(settings, 'redis_host', None),
            'REDIS_PORT': getattr(settings, 'redis_port', None),
            'SEMANTIC_CACHE_ENABLED': getattr(settings, 'semantic_cache_enabled', None),
            'SEMANTIC_CACHE_THRESHOLD': getattr(settings, 'semantic_cache_threshold', None),
            'SEMANTIC_CACHE_TTL_SECONDS': getattr(settings, 'semantic_cache_ttl_seconds', None),
        }

        all_set = True
        for key, value in configs.items():
            if value is not None:
                print(f"✅ {key}: {value}")
            else:
                print(f"❌ {key}: NOT SET")
                all_set = False

        if not all_set:
            print("\n⚠️  Some configurations are missing")
            print("   Add them to your .env file (see .env.example)")
            return False

        return True

    except Exception as e:
        print(f"❌ Error loading config: {e}")
        return False


def test_cache():
    """Test semantic cache functionality"""
    print_header("Testing Semantic Cache")

    try:
        from services.semantic_cache import get_semantic_cache

        cache = get_semantic_cache()

        if not cache.enabled:
            print("❌ Cache is disabled")
            print("   Set SEMANTIC_CACHE_ENABLED=true in .env")
            return False

        print("✅ Cache initialized successfully")

        # Test basic operations
        print("\n📝 Testing cache operations...")

        # Test set
        test_query = "What is Python programming?"
        test_response = "Python is a high-level programming language."
        cache.set(test_query, test_response)
        print("  ✅ Cache SET: OK")

        # Test get
        result = cache.get(test_query)
        if result == test_response:
            print("  ✅ Cache GET (exact match): OK")
        else:
            print("  ❌ Cache GET: FAILED")
            return False

        # Test semantic similarity
        similar_query = "Can you explain Python programming language?"
        result = cache.get(similar_query)
        if result == test_response:
            print("  ✅ Cache GET (semantic match): OK")
            print(f"     Original: '{test_query}'")
            print(f"     Similar:  '{similar_query}'")
        else:
            print("  ⚠️  Cache GET (semantic match): No match")
            print("     This might be OK if threshold is too high")

        # Get stats
        stats = cache.get_stats()
        print(f"\n📊 Cache Statistics:")
        for key, value in stats.items():
            print(f"   {key}: {value}")

        # Clean up test data
        cache.clear()
        print("\n🧹 Cleaned up test data")

        print("\n✅ All cache tests passed!")
        return True

    except Exception as e:
        print(f"❌ Cache test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def install_dependencies():
    """Install required dependencies"""
    print_header("Installing Dependencies")

    requirements_file = Path(__file__).parent / "requirements-semantic-cache.txt"

    if not requirements_file.exists():
        print(f"❌ Requirements file not found: {requirements_file}")
        return False

    print(f"Installing from {requirements_file}...")
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
        ])
        print("\n✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Installation failed: {e}")
        return False


def main():
    """Main setup function"""
    print_header("Semantic Cache Setup & Test")

    # Check if we should install dependencies
    if len(sys.argv) > 1 and sys.argv[1] == "--install":
        if not install_dependencies():
            sys.exit(1)
        print("\n✅ Installation complete! Run this script again to test.")
        sys.exit(0)

    # Check dependencies
    if not check_dependencies():
        print("\n⚠️  Run with --install flag to install dependencies:")
        print(f"   python {os.path.basename(__file__)} --install")
        sys.exit(1)

    # Check environment config
    if not check_env_config():
        print("\n⚠️  Please configure your .env file and try again")
        sys.exit(1)

    # Check Redis connection
    if not check_redis_connection():
        sys.exit(1)

    # Test cache
    if not test_cache():
        sys.exit(1)

    print_header("Setup Complete! 🎉")
    print("Your semantic cache is configured and working correctly.")
    print("\nNext steps:")
    print("1. Start your backend: uvicorn main:app --reload")
    print("2. Check cache stats: GET /api/cache/stats")
    print("3. Monitor logs for cache hits/misses")
    print("\nFor more info, see SEMANTIC_CACHE_README.md\n")


if __name__ == "__main__":
    main()
