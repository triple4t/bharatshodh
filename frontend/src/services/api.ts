
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/* =========================
 * Types
 * ========================= */
export interface Reference {
  title: string;
  snippet: string;
  url: string;
}

export interface ApiMessage {
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  file?: {
    filename: string;
    type: string;
    url: string;
    size: number;
  };
  timestamp: string;
  references?: Reference[];
  citations?: Citation[];  // NEW: RAG citations from backend
}

export interface ApiChat {
  _id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  owner_id?: string; // (server now sets this)
}

export interface ChatResponse {
  chat_id: string;
  message: ApiMessage;
  response: ApiMessage;
}

export interface ChatListResponse {
  chats: ApiChat[];
}

export interface ChatHistoryResponse {
  chat: ApiChat;
  messages: ApiMessage[];
}

/** Auth / Users **/
export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
}

export interface UserPublic {
  _id: string;           // server uses string id (email as _id in sample)
  email: string;
  name?: string | null;
  created_at: string;
}

/** Document RAG Types **/
export interface DocumentInfo {
  id: string;
  filename: string;
  upload_date: string;
  uploaded_by: string;
  doc_type: 'admin' | 'user';
  file_size: number;
  chunk_count: number;
}

export interface DocumentUploadResponse {
  message: string;
  document: DocumentInfo;
}

export interface DocumentListResponse {
  documents: DocumentInfo[];
}

export interface Citation {
  doc_id: string;
  filename: string;
  chunk_text: string;
  page_number?: number;
  relevance_score: number;
  chunk_index: number;
}

/** Chat / Messages **/
export interface Message {
  content: string;
  role: 'user' | 'assistant';
  timestamp?: string;
  citations?: Citation[];  // NEW: Citations for RAG responses
}

/* =========================
 * Simple token manager
 * ========================= */
const TOKEN_KEY = 'access_token';

let _accessToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

function setToken(token: string | null) {
  _accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }
}

function getToken(): string | null {
  return _accessToken;
}

/* =========================
 * API Service
 * ========================= */
class ApiService {
  /** Attach JSON headers + Authorization automatically */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Default JSON header if body is plain object/string and not FormData
    const isFormData = options.body instanceof FormData;
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    // Auth
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const err = await response.json();
        detail = err?.detail || detail;
      } catch {
        // ignore JSON parse errors
      }

      // Optional: auto-logout on 401
      if (response.status === 401) {
        setToken(null);
      }
      throw new Error(detail);
    }

    // If server responds with no content
    if (response.status === 204) return undefined as unknown as T;

    return response.json() as Promise<T>;
  }

  /* ========== Auth ========== */

  async register(email: string, password: string, name?: string): Promise<UserPublic> {
    return this.request<UserPublic>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    const res = await this.request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(res.access_token);
    return res;
  }

  /** Fetch the current user; throws if not authenticated */
  async me(): Promise<UserPublic> {
    return this.request<UserPublic>('/auth/me');
  }

  /** Request password reset */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /** Reset password with token */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  }

  /** Clear local token */
  logout(): void {
    this.setAccessToken(null);  // Remove the token from both localStorage and state
  }

  /** For SSR or custom storage scenarios */
  setAccessToken(token: string | null) {
    setToken(token);
  }

  getAccessToken(): string | null {
    return getToken();
  }

  isAuthenticated(): boolean {
    return !!getToken();
  }

  /* ========== Chats ========== */

  // returns both _id (server) and id (frontend convenience)
  async createChat(title?: string): Promise<ApiChat & { id: string }> {
    const res = await this.request<ApiChat>('/chat/new', {
      method: 'POST',
      body: JSON.stringify({ title: title || 'New Chat' }),
    });
    return { ...res, id: res._id };
  }

  async getAllChats(): Promise<(ApiChat & { id: string })[]> {
    const response = await this.request<ChatListResponse>('/chat');
    return response.chats.map((c) => ({ ...c, id: c._id }));
  }

  async getChatHistory(
    chatId: string,
  ): Promise<{ chat: ApiChat & { id: string }; messages: ApiMessage[] }> {
    const response = await this.request<ChatHistoryResponse>(`/chat/${chatId}`);
    return {
      chat: { ...response.chat, id: response.chat._id },
      messages: response.messages,
    };
  }

  async renameChat(chatId: string, title: string): Promise<void> {
    await this.request(`/chat/${chatId}/rename`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  }

  async deleteChat(chatId: string): Promise<void> {
    await this.request(`/chat/${chatId}`, { method: 'DELETE' });
  }

  async sendMessage(
    chatId: string,
    content: string,
    originalContent?: string,
    webSearchResults?: string | null,
    useDocuments?: boolean,
  ): Promise<ChatResponse> {
    return this.request<ChatResponse>(`/chat/${chatId}/message`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        original_content: originalContent ?? content,
        web_search_results: webSearchResults ?? null,
        use_documents: useDocuments ?? false,  // NEW: RAG toggle
      }),
    });
  }

  async webSearch(
    query: string,
  ): Promise<{ results: { name: string; url: string; snippet: string }[] }> {
    return this.request(`/web-search`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  /** Upload supports optional message + original_content + web_search_results */
  async uploadFile(
    chatId: string,
    file: File,
    opts?: {
      message?: string;
      originalContent?: string;
      webSearchResults?: string | null;
    },
  ): Promise<ChatResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (opts?.message) formData.append('message', opts.message);
    if (opts?.originalContent) formData.append('original_content', opts.originalContent);
    if (typeof opts?.webSearchResults !== 'undefined' && opts.webSearchResults !== null) {
      formData.append('web_search_results', opts.webSearchResults);
    }

    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/chat/${chatId}/upload`, {
      method: 'POST',
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      // ⚠️ Don't set Content-Type for FormData; browser sets multipart boundary
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const err = await res.json();
        detail = err?.detail || detail;
      } catch {
        // ignore
      }
      if (res.status === 401) setToken(null);
      throw new Error(detail);
    }
    return res.json();
  }



  async getSpeechAudio(
    text: string,
    voice_id = "en-IN-NeerjaIndicNeural",
    model_id = "azure"
  ): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice_id, model_id }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      throw new Error("TTS failed: " + msg);
    }
    return await res.blob();
  }

  /* ========== Text-to-Speech ========== */
  // async getSpeechAudio(
  //   text: string,
  //   // voice_id = "ZnctpSuzUbwVNbRu45m0",
  //   voice_id = "3LeCGabFP6aWC1JfuN45",
  //   model_id = "eleven_multilingual_v2"
  // ): Promise<Blob> {
  //   const res = await fetch(`${API_BASE_URL}/tts`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ text, voice_id, model_id }),
  //   });

  //   if (!res.ok) {
  //     const msg = await res.text().catch(() => res.statusText);
  //     throw new Error("TTS failed: " + msg);
  //   }
  //   return await res.blob();
  // }



  // front-end huggingface tts play example
  // async getSpeechAudio(text: string, description = "Divya, calm and clear", format: "wav"|"mp3" = "wav") {
  //   const res = await fetch(`${API_BASE_URL}/tts`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ text, description, output_format: format }),
  //   });
  //   if (!res.ok) {
  //     const errText = await res.text();
  //     throw new Error("TTS failed: " + errText);
  //   }
  //   const blob = await res.blob();
  //   const url = URL.createObjectURL(blob);
  //   const audio = new Audio(url);
  //   await audio.play();
  //   // optionally revoke URL when done
  //   audio.onended = () => URL.revokeObjectURL(url);
  // }

  /* ========== Document RAG ========== */

  /** Upload user document for RAG */
  async uploadUserDocument(file: File): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const err = await res.json();
        detail = err?.detail || detail;
      } catch {
        // ignore
      }
      if (res.status === 401) setToken(null);
      throw new Error(detail);
    }
    return res.json();
  }

  /** Get user's documents */
  async getUserDocuments(): Promise<DocumentListResponse> {
    return this.request<DocumentListResponse>('/documents');
  }

  /** Get admin documents (for user reference) */
  async getAdminDocuments(): Promise<DocumentListResponse> {
    return this.request<DocumentListResponse>('/documents/admin');
  }

  /** Delete user document */
  async deleteUserDocument(docId: string): Promise<void> {
    await this.request(`/documents/${docId}`, { method: 'DELETE' });
  }

}

export const apiService = new ApiService();
