export type WebSearchResult = {
  title: string;
  url: string;
  snippet: string;
};

export interface Reference {
  title: string;
  url: string;
  snippet: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
   // ✅ Add these fields
  sources?: WebSearchResult[]; // ✅ Add this if not already
  file?: File;
  fileName?: string;
  fileType?: string;
  references?: Reference[];  // ✅ Add this line
}

export interface Chat {
  [x: string]: SetStateAction<string | null>;
  _id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VoiceState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
}

export interface TTSState {
  isSpeaking: boolean;
  isEnabled: boolean;
  isSupported: boolean;
   isLoading: boolean;
}

export interface UserPublic {
  _id: string;           // server uses string id (email as _id in sample)
  email: string;
  name?: string | null;
  created_at: string;
}

