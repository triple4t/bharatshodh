# ChatGPT Web UI Clone

A full-featured ChatGPT clone built with React.js frontend and FastAPI backend, featuring Azure GPT-4o integration, LangChain document processing, and MongoDB for persistent storage.

## 🚀 Features

### Frontend (React + Tailwind CSS)

- **Modern Chat Interface**: Dark-themed UI with responsive design
- **Voice Integration**: Speech-to-text and text-to-speech using Web APIs
- **File Upload Support**: Handle PDFs, Word docs, images, and text files
- **Chat Management**: Create, rename, delete, and organize conversations
- **Markdown Rendering**: Rich text formatting for AI responses
- **Mobile Responsive**: Collapsible sidebar and touch-friendly interface

### Backend (FastAPI + Azure GPT-4o + LangChain + MongoDB)

- **Azure GPT-4o Integration**: Advanced AI responses with vision capabilities
- **Document Processing**: Extract and analyze content from various file types
- **Persistent Memory**: MongoDB storage for chat history and context
- **File Analysis**: Intelligent document summarization and Q&A
- **Image Understanding**: Describe and analyze uploaded images
- **Auto Title Generation**: Smart chat titles based on conversation content

### Add two tap in Backend

1. **RAG Document**: Upload document and question & answer with individual document
1. **TextToSQL Document**: Upload document and question & answer with individual document (excel and csv)

## 🛠️ Tech Stack

**Frontend:**

- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- React Markdown for rich text
- Web Speech API for voice features

**Backend:**

- FastAPI with async/await
- Azure OpenAI GPT-4o
- LangChain for document processing
- MongoDB with Motor (async driver)
- Python multipart for file uploads

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- MongoDB (local or cloud)
- Azure OpenAI account with GPT-4o deployment

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Create env
python -m venv venv

# Activate env
venv\Scripts\Activate

# Install Python dependencies
pip install -r requirements.txt

pip uninstall python-magic python-magic-bin -y
pip install python-magic-bin==0.4.14

# Configure environment variables
cp .env.example .env
# Edit .env with your Azure OpenAI and MongoDB credentials

# Start the FastAPI server
python main.py
```

### 2. Frontend Setup

```bash
# Install dependencies (from project root)
npm install

# Start the development server
npm run dev
```

### 3. Environment Configuration

Update `backend/.env` with your credentials:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o

# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=chatgpt_clone
```

## 📁 Project Structure

```
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API service layer
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
├── backend/               # FastAPI backend
│   ├── services/          # Business logic
│   ├── models.py          # Pydantic models
│   ├── database.py        # MongoDB connection
│   ├── config.py          # Configuration
│   └── main.py            # FastAPI app
└── uploads/               # File storage directory
```

## 🔧 API Endpoints

- `POST /api/chat/new` - Create new chat session
- `GET /api/chat` - List all chats
- `GET /api/chat/{chat_id}` - Get chat history
- `PUT /api/chat/{chat_id}/rename` - Rename chat
- `DELETE /api/chat/{chat_id}` - Delete chat
- `POST /api/chat/{chat_id}/message` - Send message
- `POST /api/chat/{chat_id}/upload` - Upload file

## 🎯 Key Features

### Document Processing

- **PDF Analysis**: Extract text and answer questions about PDF content
- **Word Documents**: Process .docx files with full text extraction
- **Image Understanding**: Describe images and answer visual questions
- **Text Files**: Handle plain text documents

### Conversation Management

- **Persistent Storage**: All chats saved to MongoDB
- **Context Awareness**: Full conversation history maintained
- **Auto Titles**: Smart title generation based on content
- **Chat Organization**: Easy management of multiple conversations

### Voice Features

- **Speech-to-Text**: Convert voice input to text
- **Text-to-Speech**: Read AI responses aloud
- **Browser Integration**: Uses native Web Speech APIs

## 🔒 Security Features

- CORS configuration for secure cross-origin requests
- File size limits and type validation
- Input sanitization and error handling
- Secure file storage with unique identifiers

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-friendly interface
- Collapsible sidebar for mobile
- Optimized typography and spacing

## 🚀 Deployment

### Backend Deployment

```bash
# Production server
uvicorn main:app --host 0.0.0.0 --port 8000

# With Docker
docker build -t chatgpt-backend .
docker run -p 8000:8000 chatgpt-backend
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Serve static files
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for the GPT-4o model
- LangChain for document processing capabilities
- FastAPI for the excellent async web framework
- React team for the amazing frontend library
