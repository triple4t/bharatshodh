

import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import InputBox from "./InputBox";
import { Chat, Message, WebSearchResult } from "../types";
import { getChatHistory, getChatWithMessages } from "../utils/chatStorage";
import { apiService } from "../services/api";
import { useVoice } from "../hooks/useVoice";
import { Sun, Moon } from "lucide-react";

import {
  enhanceMessagesWithSources,
  parseWebSourcesFromContent,
} from "../utils/messageEnhancer";
import { useThemeMode } from "../context/ThemeContext";
import { CheckCircle, AlertCircle } from "lucide-react";

function ChatApp() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const { speak, stopSpeaking, ttsState } = useVoice();
  const { setMode, resolvedMode } = useThemeMode();

  // Load chat history on mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        const savedChats = await getChatHistory();
        setChats(savedChats);

        if (savedChats.length > 0) {
          const mostRecent = savedChats.sort(
            (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
          )[0];
          setCurrentChatId(mostRecent.id);

          const chatWithMessages = await getChatWithMessages(mostRecent.id);
          if (chatWithMessages) {
            setChats((prev) =>
              prev.map((chat) =>
                chat.id === mostRecent.id ? chatWithMessages : chat
              )
            );
          }
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
        showNotification("Failed to load chat history", "error");
      }
    };

    loadChats();
  }, []);

  useEffect(() => {
    const loadChatMessages = async () => {
      if (!currentChatId || currentChatId === "undefined") return;

      const chat = chats.find((c) => c.id === currentChatId);

      if (!chat || !chat.messages || chat.messages.length === 0) {
        try {
          const chatWithMessages = await getChatWithMessages(currentChatId);
          if (chatWithMessages) {
            setChats((prev) =>
              prev.map((chat) =>
                chat.id === currentChatId ? chatWithMessages : chat
              )
            );
          }
        } catch (error) {
          console.error("Failed to load chat messages:", error);
        }
      }
    };

    loadChatMessages();
  }, [currentChatId]);

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  const showNotification = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Create new chat
  const handleNewChat = useCallback(() => {
    const createNewChat = async () => {
      try {
        const apiChat = await apiService.createChat();
        const newChat: Chat = {
          id: apiChat._id,
          title: apiChat.title,
          messages: [],
          createdAt: new Date(apiChat.created_at),
          updatedAt: new Date(apiChat.updated_at),
        };

        setChats((prev) => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        showNotification("New chat created", "success");
      } catch (error) {
        console.error("Failed to create new chat:", error);
        showNotification("Failed to create new chat", "error");
      }
    };

    createNewChat();
  }, []);

  // Select existing chat
  const handleSelectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
  }, []);

  // Delete chat
  const handleDeleteChat = useCallback(
    (chatId: string) => {
      const deleteChat = async () => {
        try {
          await apiService.deleteChat(chatId);
          setChats((prev) => prev.filter((chat) => chat.id !== chatId));

          if (currentChatId === chatId) {
            const remainingChats = chats.filter((chat) => chat.id !== chatId);
            setCurrentChatId(
              remainingChats.length > 0 ? remainingChats[0].id : null
            );
          }
          showNotification("Chat deleted", "success");
        } catch (error) {
          console.error("Failed to delete chat:", error);
          showNotification("Failed to delete chat", "error");
        }
      };

      deleteChat();
    },
    [chats, currentChatId]
  );

  // Rename chat
  const handleRenameChat = useCallback((chatId: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    const renameChat = async () => {
      try {
        await apiService.renameChat(chatId, newTitle);

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? { ...chat, title: newTitle.trim(), updatedAt: new Date() }
              : chat
          )
        );
        showNotification("Chat renamed", "success");
      } catch (error) {
        console.error("Failed to rename chat:", error);
        showNotification("Failed to rename chat", "error");
      }
    };

    renameChat();
  }, []);

  const handleSendMessage = useCallback(
    async (content: string, file?: File, useWebSearch?: boolean, useDocuments?: boolean) => {
      if (!content.trim() && !file) return;

      let chatId = currentChatId;

      if (!chatId) {
        try {
          const apiChat = await apiService.createChat();
          const newChat: Chat = {
            id: apiChat._id,
            title: apiChat.title,
            messages: [],
            createdAt: new Date(apiChat.created_at),
            updatedAt: new Date(apiChat.updated_at),
          };

          setChats((prev) => [newChat, ...prev]);
          chatId = newChat.id;
          setCurrentChatId(chatId);
        } catch (error) {
          console.error("Failed to create new chat:", error);
          showNotification("Failed to create new chat", "error");
          return;
        }
      }

      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content,
        timestamp: new Date(),
        file,
        fileName: file?.name,
        fileType: file?.type,
      };

      const loadingMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === chatId) {
            const isFirstMessage = chat.messages.length === 0;

            return {
              ...chat,
              messages: [...chat.messages, userMessage, loadingMessage],
              updatedAt: new Date(),
              title: isFirstMessage
                ? userMessage.content.slice(0, 30)
                : chat.title,
            };
          }
          return chat;
        })
      );

      try {
        let finalContent = content;
        let webSearchResults = null;
        let formattedResults: string | null = null;

        if (useWebSearch) {
          try {
            const result = await apiService.webSearch(content);
            webSearchResults = result.sources || result.results || [];

            if (webSearchResults.length > 0) {
              formattedResults = webSearchResults
                .map(
                  (res: any, index: number) =>
                    `🔹 [${res.name || res.title}](${res.link || res.url})\n${
                      res.snippet || res.text
                    }`
                )
                .join("\n\n");

              finalContent = `Here are some web search results:\n\n${formattedResults}\n\nBased on this information, answer the following:\n${content}`;
            }
          } catch (err) {
            console.warn("Web search failed, continuing with LLM only:", err);
            showNotification(
              "Web search unavailable, using AI knowledge",
              "info"
            );
          }
        }

        let response;
        if (file) {
          response = await apiService.uploadFile(chatId, file, finalContent);
        } else {
          response = await apiService.sendMessage(
            chatId,
            finalContent,
            content,
            formattedResults,
            useDocuments  // NEW: Pass document toggle state
          );
        }

        let sources: WebSearchResult[] | undefined = undefined;
        if (formattedResults) {
          sources = parseWebSourcesFromContent(formattedResults);
        }

        const assistantMessage: Message = {
          id: response.response.chat_id + "-" + response.response.timestamp,
          role: response.response.role,
          content: response.response.content,
          timestamp: new Date(response.response.timestamp),
          ...(sources && { sources }),
          references: response.response.references,
        };

        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id === chatId) {
              const withoutLoading = chat.messages.filter((m) => !m.isLoading);
              const enhanced = enhanceMessagesWithSources([
                ...withoutLoading,
                assistantMessage,
              ]);
              return {
                ...chat,
                messages: enhanced,
                updatedAt: new Date(),
              };
            }
            return chat;
          })
        );
      } catch (error) {
        console.error("Failed to send message:", error);
        showNotification("Failed to send message. Please try again.", "error");

        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id === chatId) {
              const messagesWithoutLoading = chat.messages.filter(
                (msg) => !msg.isLoading
              );
              const errorMessage: Message = {
                id: uuidv4(),
                role: "assistant",
                content:
                  "Sorry, I encountered an error while processing your message. Please try again.",
                timestamp: new Date(),
              };

              return {
                ...chat,
                messages: [...messagesWithoutLoading, errorMessage],
                updatedAt: new Date(),
              };
            }
            return chat;
          })
        );
      }
    },
    [currentChatId, speak, ttsState]
  );

  const handleCopy = useCallback((message: string) => {
    showNotification(message, "success");
  }, []);

  return (
    <div
      className="flex flex-col md:flex-row h-screen font-sans transition-colors duration-200"
      style={{
        background: `
          linear-gradient(135deg, var(--theme-background) 0%, var(--theme-secondary-bg) 100%)
        `,
        color: "var(--theme-text)",
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)
        `,
      }}
    >
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {/* Simple theme toggle */}
        <button
          onClick={() => {
            // Simple toggle: light ↔ dark
            setMode(resolvedMode === "dark" ? "light" : "dark");
          }}
          title={`Theme: ${resolvedMode === "dark" ? "Dark" : "Light"}`}
          style={{
            position: "fixed",
            top: "5px",
            // top: "clamp(16px, 4vw, 24px)",
            right: "clamp(16px, 4vw, 24px)",
            zIndex: 50,
            width: "clamp(44px, 10vw, 48px)",
            height: "clamp(44px, 10vw, 48px)",
            borderRadius: "50%",
            background: "var(--theme-surface-bg)",
            border: "2px solid var(--theme-borderColor)",
            color: "var(--theme-iconColor)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 16px var(--theme-shadow)`,
            transition: "var(--theme-transition)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = `0 8px 24px var(--theme-shadow)`;
            e.currentTarget.style.borderColor = "var(--theme-iconColor)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = `0 4px 16px var(--theme-shadow)`;
            e.currentTarget.style.borderColor = "var(--theme-borderColor)";
          }}
        >
          {resolvedMode === "dark" ? (
            <Moon size={20} />
          ) : (
            <Sun size={20} />
          )}
        </button>

        {/* Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          currentChatTitle={currentChat?.title}
        />
        {/* Header spacer - hide when sidebar is open */}
        <div
          className={`h-[60px] hidden md:block transition-all duration-300 ${
            sidebarOpen ? "h-0 opacity-0" : "h-[60px] opacity-100"
          }`}
          style={{
            borderBottom: sidebarOpen
              ? "none"
              : "2px solid var(--theme-borderColor)",
            background: "var(--theme-surface-bg)",
            overflow: "hidden",
          }}
        />

        {/* Chat Container */}
        <div
          className="flex-1 flex flex-col overflow-hidden min-h-0"
          style={{
            background: "var(--theme-surface-bg)",
            border: "1px solid var(--theme-borderColor)",
            boxShadow: `0 8px 32px var(--theme-shadow)`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            margin: "0",
            borderRadius: "0",
          }}
        >
          {/* Chat Window */}
          <ChatWindow
            messages={currentChat?.messages || []}
            onCopy={handleCopy}
            onSpeak={speak}
            onStopSpeaking={stopSpeaking}
          />

          {/* Input Box */}
          <InputBox
            onSendMessage={handleSendMessage}
            placeholder="Ask me anything..."
          />
        </div>
      </div>



      {/* Enhanced Notification System */}
      {notification && (
        <div
          className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-6 md:right-6 z-50"
          style={{
            background: "var(--theme-surface-bg)",
            borderRadius: "12px",
            padding: "clamp(12px, 3vw, 16px) clamp(16px, 4vw, 20px)",
            border: "1px solid var(--theme-borderColor)",
            boxShadow: `0 8px 32px var(--theme-shadow)`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            maxWidth: "320px",
            display: "flex",
            alignItems: "center",
            gap: "clamp(8px, 2vw, 12px)",
            animation: "slideInUp 0.3s ease-out",
          }}
        >
          {notification.type === "success" && (
            <CheckCircle size={20} style={{ color: "var(--theme-success)" }} />
          )}
          {notification.type === "error" && (
            <AlertCircle size={20} style={{ color: "var(--theme-error)" }} />
          )}
          {notification.type === "info" && (
            <AlertCircle
              size={20}
              style={{ color: "var(--theme-iconColor)" }}
            />
          )}
          <span
            style={{
              color: "var(--theme-text)",
              fontSize: "clamp(12px, 2.5vw, 14px)",
              fontWeight: "500",
            }}
          >
            {notification.message}
          </span>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default ChatApp;
