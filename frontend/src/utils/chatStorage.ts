import { Chat } from '../types';
import { apiService, ApiChat, ApiMessage } from '../services/api';

// Convert API types to local types
const convertApiChatToLocal = (apiChat: ApiChat): Chat => ({
  id: apiChat.id,
  title: apiChat.title,
  messages: [], // Messages loaded separately
  createdAt: new Date(apiChat.created_at),
  updatedAt: new Date(apiChat.updated_at)
});

// const convertApiMessageToLocal = (apiMessage: ApiMessage) => ({
//   id: `${apiMessage.chat_id}-${apiMessage.timestamp}`,
//   role: apiMessage.role,
//   content: apiMessage.content,
//   timestamp: new Date(apiMessage.timestamp)
// });

const convertApiMessageToLocal = (apiMessage: ApiMessage) => ({
  id: `${apiMessage.chat_id}-${apiMessage.timestamp}`,
  role: apiMessage.role,
  content: apiMessage.content,
  timestamp: new Date(apiMessage.timestamp),
  file: apiMessage.file, // ✅ Preserve file object
  fileName: apiMessage.file?.filename,
  fileType: apiMessage.file?.type,
});
export const getChatHistory = async (): Promise<Chat[]> => {
  try {
    const apiChats = await apiService.getAllChats();
    return apiChats.map(convertApiChatToLocal);
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return [];
  }
};

export const getChatWithMessages = async (chatId: string): Promise<Chat | null> => {
  try {
    const { chat, messages } = await apiService.getChatHistory(chatId);
    return {
      ...convertApiChatToLocal(chat),
      messages: messages.map(convertApiMessageToLocal)
    };
  } catch (error) {
    console.error('Failed to load chat with messages:', error);
    return null;
  }
};

export const saveChatHistory = (chats: Chat[]): void => {
  // No longer needed - data is saved to backend
  // Keep function for compatibility
};

export const generateChatTitle = (firstMessage: string): string => {
  const words = firstMessage.trim().split(' ').slice(0, 4);
  return words.join(' ') + (words.length >= 4 ? '...' : '');
};