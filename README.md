# BharatShodh - Enterprise RAG-Powered Chat Platform

> An enterprise-grade AI chat platform with advanced RAG (Retrieval-Augmented Generation), document management, and multi-role support.

## 🌟 Overview

BharatShodh is a full-stack AI chat application that combines the power of large language models with enterprise document management and retrieval systems. Built for scalability and performance, it supports unlimited document sizes, multi-language processing (including Hindi), and real-time streaming responses.

---

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Python FastAPI + MongoDB + FAISS
- **Admin Panel**: React Admin Dashboard
- **AI**: Azure OpenAI GPT-4 with streaming
- **Vector Search**: FAISS with HNSW algorithm
- **Document Processing**: PyMuPDF + OCR (Tesseract)

---

## 🎯 Core Features

### 🔐 **Authentication & Authorization**

- **User Authentication**
  - Email/password authentication
  - Secure JWT token management
  - Session persistence
  - Auto-login on page reload

- **Admin Authentication**
  - Separate admin authentication system
  - Role-based access control
  - Admin-only document management
  - User approval workflow

### 💬 **Chat Features**

- **AI Conversations**
  - GPT-4 powered responses
  - Real-time streaming text generation
  - Context-aware conversations
  - Multi-turn dialogue support

- **Chat Management**
  - Create unlimited chats
  - Auto-generated chat titles
  - Rename chats
  - Delete chats
  - Chat history persistence
  - Search through conversations

- **Rich Content Support**
  - File uploads (images, documents)
  - Image analysis with GPT-4 Vision
  - Web search integration
  - Code syntax highlighting
  - Markdown rendering
  - LaTeX math support

### 📚 **Enterprise Document Management**

#### **Streaming Document Ingestion**
- **Unlimited File Size**: Handle PDFs up to 300MB+ (1000+ pages)
- **Memory-Safe Processing**: Page-by-page streaming (never loads entire PDF)
- **Background Processing**: Non-blocking async document processing
- **Incremental Updates**: FAISS index updated after each batch
- **Partial Availability**: First 20 pages searchable while rest processes
- **Progress Tracking**: Real-time status updates (uploaded, processing, partially_ready, completed, failed)

#### **Advanced Text Extraction**
- **PyMuPDF Integration**: Better Unicode/Hindi support than pypdf
- **OCR Support**: Automatic OCR for scanned/image-based PDFs
- **Multi-Language**: Hindi + English text extraction
- **Error Recovery**: Skips corrupted pages, continues processing

#### **Document Types**
- **Admin Documents**: Shared across all users
- **User Documents**: Private, user-specific documents
- **Supported Formats**: PDF, DOCX, TXT

#### **Upload Status Tracking**
- `UPLOADED`: File saved to disk
- `PROCESSING`: Currently being processed
- `PARTIALLY_READY`: First batch done, searchable
- `COMPLETED`: Fully processed
- `FAILED`: Processing error with details

### 🔍 **RAG (Retrieval-Augmented Generation)**

#### **Hybrid Search System**
- **Two-Stage Retrieval**:
  1. **FAISS Vector Search**: O(log N) fast candidate retrieval (top 50)
  2. **Hybrid Reranking**: Semantic (70%) + BM25 (30%) scoring

- **Performance**: 100x faster than full database scan for 10k+ documents

#### **Citation System**
- **Persistent Citations**: Survives page reloads (saved to MongoDB)
- **Rich Metadata**: Document name, page numbers, relevance scores, chapter info
- **Interactive Sources**: Clickable citation cards with expandable content
- **Multi-Document**: Retrieves from all uploaded documents

#### **FAISS Vector Index**
- **Algorithm**: HNSW (Hierarchical Navigable Small World)
- **Storage**: 70% less storage (embeddings in FAISS, not MongoDB)
- **Incremental Updates**: Add/remove documents without rebuild
- **Metadata Mapping**: Efficient chunk_id → document mapping

### 🎤 **Voice & Audio**

- **Text-to-Speech (TTS)**
  - Azure Neural TTS
  - Multiple voice options
  - Natural-sounding speech
  - Background audio playback

- **Audio Controls**
  - Play/pause toggle
  - Speaker icon indicators
  - Stop speaking functionality

### 🌐 **Web Search Integration**

- **Brave Search API**
  - Real-time web search
  - Summarized search results
  - Source citations
  - Integrated into chat context

### 🎨 **UI/UX Features**

- **Theme Support**
  - Light/Dark mode toggle
  - System preference detection
  - Persistent theme selection

- **Responsive Design**
  - Mobile-first approach
  - Adaptive layouts
  - Touch-optimized controls

- **Interactive Elements**
  - Copy to clipboard
  - Message regeneration
  - File preview
  - Citation expandable cards
  - Loading states & skeletons

---

## 🛡️ **Admin Panel Features**

### 📊 **Dashboard**
- User statistics
- Document usage metrics
- System health monitoring
- Recent activity logs

### 👥 **User Management**
- View all registered users
- Approve/reject new users
- Monitor user activity
- Delete users

### 📁 **Document Management**
- Upload admin documents (shared globally)
- View all user-uploaded documents
- Delete documents
- Monitor processing status
- View document metadata (pages, chunks, size)

### 🔐 **Security**
- Admin-only access
- Secure document storage
- User data privacy
- Activity logging

---

## 🔧 **Backend API Endpoints**

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/admin/register` - Admin registration
- `POST /api/admin/login` - Admin login

### **Chat**
- `POST /api/chat/new` - Create new chat
- `GET /api/chat` - Get all user chats
- `GET /api/chat/{chat_id}` - Get chat history with messages
- `POST /api/chat/{chat_id}/message` - Send message (supports RAG)
- `PUT /api/chat/{chat_id}/rename` - Rename chat
- `DELETE /api/chat/{chat_id}` - Delete chat

### **Documents**
- `POST /api/documents/upload-async` - Upload document (streaming, non-blocking)
- `GET /api/documents` - Get user documents
- `GET /api/documents/admin` - Get admin documents
- `GET /api/documents/{doc_id}/status` - Get processing status
- `DELETE /api/documents/{doc_id}` - Delete document

### **Admin**
- `POST /api/admin/documents/upload` - Upload admin document (no size limit)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/{user_id}/approve` - Approve user
- `DELETE /api/admin/users/{user_id}` - Delete user
- `GET /api/admin/stats` - Get system statistics

### **Utilities**
- `POST /api/web-search` - Web search
- `POST /api/tts` - Text-to-speech
- `GET /api/cache/stats` - Semantic cache statistics
- `POST /api/cache/clear` - Clear semantic cache

---

## 🚀 **Performance Optimizations**

### **Vector Search**
- **FAISS HNSW Index**: Sub-linear search complexity O(log N)
- **Storage Reduction**: 70% less database storage
- **Incremental Updates**: No full index rebuild needed

### **Document Processing**
- **Streaming**: Processes PDFs page-by-page
- **Batching**: 20 pages per batch with incremental saves
- **Background Tasks**: Non-blocking async processing
- **Memory Safety**: No full file loads, handles 300MB+ PDFs

### **Caching**
- **Semantic Cache**: Reuse similar query responses
- **Embedding Cache**: Cache computed embeddings
- **FAISS Persistence**: Disk-based index storage

### **Database**
- **MongoDB Indexing**: Optimized queries
- **Chunk Storage**: Embeddings in FAISS, text in MongoDB
- **Aggregation Pipelines**: Efficient data retrieval

---

## 📦 **Installation & Setup**

### **Prerequisites**
- Python 3.10+
- Node.js 18+
- MongoDB
- Tesseract OCR (for scanned PDFs)

### **Backend Setup**

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Environment variables (.env)
AZURE_OPENAI_KEY=your_key
AZURE_OPENAI_ENDPOINT=your_endpoint
MONGODB_URI=your_mongo_uri
BRAVE_SEARCH_API_KEY=your_key
```

**Start Backend:**
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

### **Admin Panel Setup**

```bash
cd admin-panel
npm install
npm run dev
```

---

## 🧪 **Testing**

### **Diagnostic Scripts**

**Check FAISS Index:**
```bash
cd backend
python debug_faiss.py
```

**Check MongoDB Documents:**
```bash
python check_docs.py
```

**Check Citations Persistence:**
```bash
python check_citations.py
```

**Cleanup FAISS:**
```bash
python cleanup_faiss.py
```

---

## 📊 **Database Schema**

### **Collections**

**users**
```javascript
{
  _id: ObjectId,
  email: string,
  hashed_password: string,
  created_at: datetime,
  is_approved: boolean
}
```

**chats**
```javascript
{
  _id: string,
  title: string,
  owner_id: string,
  created_at: datetime,
  updated_at: datetime,
  message_count: number
}
```

**messages**
```javascript
{
  _id: ObjectId,
  chat_id: string,
  role: "user" | "assistant" | "system",
  content: string,
  owner_id: string,
  timestamp: datetime,
  citations: Citation[],  // RAG citations
  file: FileInfo,
  references: Reference[]
}
```

**documents**
```javascript
{
  _id: string,
  filename: string,
  upload_date: datetime,
  uploaded_by: string,
  doc_type: "admin" | "user",
  file_size: number,
  chunk_count: number,
  chunks: Chunk[],  // No embeddings (stored in FAISS)
  status: DocumentStatus
}
```

**document_progress**
```javascript
{
  doc_id: string,
  status: "uploaded" | "processing" | "partially_ready" | "completed" | "failed",
  total_pages: number,
  pages_processed: number,
  chunks_created: number,
  error_message: string,
  started_at: datetime,
  updated_at: datetime,
  completed_at: datetime
}
```

---

## 🔒 **Security Features**

- JWT-based authentication
- Password hashing (bcrypt)
- CORS protection
- Environment variable configuration
- User isolation (documents & chats)
- Admin role separation
- Secure file uploads

---

## 🌍 **Multi-Language Support**

- **Hindi Text Extraction**: PyMuPDF with Unicode support
- **OCR**: Hindi + English with Tesseract
- **Language Detection**: Automatic language handling
- **Embedding Models**: Multilingual support

---

## 📈 **Scalability**

- **Unlimited Documents**: No hard limits on document count
- **Large Files**: Handle 300MB+ PDFs safely
- **Concurrent Uploads**: Multiple simultaneous uploads
- **Background Processing**: Non-blocking ingestion
- **Incremental Indexing**: Add documents without full rebuild

---

## 🎯 **Use Cases**

1. **Enterprise Knowledge Base**: Search across company documents
2. **Educational Platform**: Students query textbooks and notes
3. **Research Assistant**: Academic paper analysis
4. **Customer Support**: Query product manuals and FAQs
5. **Legal Document Search**: Case law and contract analysis

---

## 📝 **Citation Format**

```typescript
{
  doc_id: string,
  filename: string,
  chunk_text: string,
  relevance_score: number,
  chunk_index: number,
  page_start: number,
  page_end: number,
  chapter: string | null
}
```

---

## 🛠️ **Tech Stack Details**

### **Frontend**
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Markdown
- Lucide Icons

### **Backend**
- FastAPI
- Python 3.11
- Motor (async MongoDB)
- FAISS (vector search)
- PyMuPDF (PDF processing)
- Pytesseract (OCR)
- LangChain (embeddings & text splitting)
- Azure OpenAI SDK

### **Database & Storage**
- MongoDB (documents & metadata)
- FAISS (vector embeddings)
- Local file system (PDF storage)

---

## 📞 **Support & Contribution**

For issues, feature requests, or contributions, please refer to the project repository.

---

## 📄 **License**

Copyright © 2025 BharatShodh. All rights reserved.

---

**Built with ❤️ for enterprise document intelligence**
