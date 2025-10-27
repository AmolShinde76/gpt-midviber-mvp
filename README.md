# Medical Document Search Assistant

A full-stack application for AI-powered Q&A on medical documents using OpenAI's Assistant API.

## Features

- **Document Upload & Search**: Upload medical documents and ask questions
- **AI-Powered Responses**: Get accurate answers using OpenAI GPT-4o-mini
- **Real-time Streaming**: Fast streaming responses for better UX
- **PDF Viewer**: Integrated document viewing with page navigation
- **Secure**: Environment-based configuration and input validation

## Quick Start

### ⚡ One-Click Start (Windows)
```bash
# Double-click this file to start both frontend and backend
start.bat
```

### 🐧 One-Click Start (Linux/Mac)
```bash
chmod +x start.sh
./start.sh
```

### Manual Start

1. **Set your OpenAI API key** in `backend/.env`:
   ```
   OPENAI_API_KEY=your-openai-api-key-here
   ```

2. **Start Backend**:
   ```bash
   cd backend
   python start.py
   ```

3. **Start Frontend** (in new terminal):
   ```bash
   cd frontend/my-app
   npm run dev
   ```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Features

✅ **Fast Streaming Responses** - Real-time AI answers
✅ **Enterprise Security** - Environment variables, input validation, CORS protection
✅ **Production Ready** - Error handling, logging, proper architecture
✅ **Medical Document Support** - PDF viewing, Q&A on medical content