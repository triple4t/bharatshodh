
import React, { useEffect, useState } from "react";
import { useThemeMode } from "../context/ThemeContext";
import {
  MessageSquare,
  Trash2,
  Edit3,
  X,
  SquarePen,
  LogOut,
  User,
  Sparkles,
} from "lucide-react";
import { Chat } from "../types";
import classNames from "classnames";
import LogoBlack from "../asset/img/bharat5.png";
import LogoWhite from "../asset/img/bharat5.png";

import { apiService, UserPublic } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  isOpen,
  onClose,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [userInfo, setUserInfo] = useState<UserPublic | null>(null);
  const { signOut } = useAuth();
  const { resolvedMode } = useThemeMode();

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await apiService.me();
        setUserInfo(user);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    signOut();
  };

  const handleRename = (chatId: string, title: string) => {
    setEditingId(chatId);
    setEditTitle(title);
  };

  const handleSaveRename = () => {
    if (editingId && editTitle.trim()) {
      onRenameChat(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const logoSrc = resolvedMode === "dark" ? LogoWhite : LogoBlack;

  const getUserInitials = (name: string) => {
    const [firstName, lastName] = name.split(" ");
    return (
      firstName.charAt(0) + (lastName ? lastName.charAt(0) : "")
    ).toUpperCase();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{
            background: "var(--theme-overlay)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={classNames(
          "fixed md:relative top-0 left-0 h-full w-72 flex flex-col z-50 transform transition-all duration-300 ease-out",
          {
            "translate-x-0": isOpen,
            "-translate-x-full md:translate-x-0": !isOpen,
          }
        )}
        style={{
          background: "var(--theme-sidebarBg)",
          borderRight: "1px solid var(--theme-sidebarBorder)",
          boxShadow: isOpen ? `8px 0 32px var(--theme-shadow)` : "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            borderBottom: "1px solid var(--theme-borderColor)",
            background: "var(--theme-surface-bg)",
          }}
          className="p-2 md:p-3 relative"
        >
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 p-2 rounded-lg transition-all duration-200"
            style={{
              background: "var(--theme-iconBg)",
              color: "var(--theme-iconColor)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--theme-iconHover)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--theme-iconBg)";
              e.currentTarget.style.color = "var(--theme-iconColor)";
            }}
          >
            <X size={18} />
          </button>

          {/* Logo and title */}
          <div className="flex items-center gap-3 mb-6">
            <div
              style={{
                padding: "0px",
                borderRadius: "12px",
                background: "var(--theme-iconBg)",
                border: "1px solid var(--theme-borderColor)",
              }}
            >
              <img
                src={logoSrc}
                alt="BharatShodh"
                className="w-10 h-10 rounded-lg"
              />
            </div>
            <div>
              <h2
                style={{
                  color: "var(--theme-text)",
                  fontSize: "24px",
                  fontWeight: "700",
                  margin: 0,
                }}
              >
                BharatShodh
              </h2>
              <p
                style={{
                  color: "var(--theme-text-secondary)",
                  fontSize: "12px",
                  margin: 0,
                }}
              >
                AI Assistant
              </p>
            </div>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 12px",
              borderRadius: "12px",
              border: "2px solid var(--theme-sendButtonBg)",
              background: `linear-gradient(135deg, var(--theme-sendButtonBg) 0%, var(--theme-sendButtonHover) 100%)`,
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "var(--theme-transition)",
              boxShadow: `0 4px 12px rgba(59, 130, 246, 0.3)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 8px 20px rgba(59, 130, 246, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(59, 130, 246, 0.3)";
            }}
          >
            <SquarePen size={18} />
            New Chat
            <Sparkles size={16} style={{ marginLeft: "auto" }} />
          </button>
        </div>

        {/* Chat History */}
        <div
          className="flex-1 overflow-y-auto py-2 md:py-4"
          style={{ scrollbarWidth: "thin" }}
        >
          {chats.length === 0 ? (
            <div
              style={{
                color: "var(--theme-text-secondary)",
                textAlign: "center",
                padding: "32px 16px",
              }}
            >
              <MessageSquare
                size={48}
                style={{
                  color: "var(--theme-text-tertiary)",
                  margin: "0 auto 16px auto",
                  display: "block",
                }}
              />
              <p style={{ fontSize: "14px", lineHeight: "1.5", margin: 0 }}>
                No conversations yet.
                <br />
                Start a new chat to begin your journey.
              </p>
            </div>
          ) : (
            <div className="space-y-2 px-2 md:px-3">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className="group relative"
                  style={{
                    borderRadius: "12px",
                    transition: "var(--theme-transition)",
                  }}
                >
                  <div
                    className="flex items-center gap-3 p-2 md:p-3 cursor-pointer"
                    style={{
                      background:
                        chat.id === currentChatId
                          ? "var(--theme-sendButtonBg)"
                          : "transparent",
                      color:
                        chat.id === currentChatId
                          ? "#ffffff"
                          : "var(--theme-text)",
                      borderRadius: "12px",
                      transition: "var(--theme-transition)",
                    }}
                    onMouseEnter={(e) => {
                      if (chat.id !== currentChatId) {
                        e.currentTarget.style.background =
                          "var(--theme-iconBg)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (chat.id !== currentChatId) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <MessageSquare
                      size={16}
                      style={{
                        color:
                          chat.id === currentChatId
                            ? "rgba(255, 255, 255, 0.8)"
                            : "var(--theme-iconColor)",
                        flexShrink: 0,
                      }}
                    />

                    {editingId === chat.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleSaveRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename();
                          if (e.key === "Escape") handleCancelRename();
                        }}
                        style={{
                          flex: 1,
                          fontSize: "14px",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          border: "1px solid var(--theme-inputBorder)",
                          background: "var(--theme-inputBg)",
                          color: "var(--theme-text)",
                          outline: "none",
                        }}
                        autoFocus
                      />
                    ) : (
                      <span
                        onClick={() => {
                          onSelectChat(chat.id);
                          onClose();
                        }}
                        style={{
                          flex: 1,
                          fontSize: "14px",
                          fontWeight: "500",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {chat.title}
                      </span>
                    )}

                    {/* Action buttons */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRename(chat.id, chat.title);
                        }}
                        style={{
                          padding: "6px",
                          borderRadius: "6px",
                          background: "var(--theme-iconBg)",
                          color: "var(--theme-iconColor)",
                          border: "none",
                          cursor: "pointer",
                          transition: "var(--theme-transition)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "var(--theme-iconHover)";
                          e.currentTarget.style.color = "#ffffff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "var(--theme-iconBg)";
                          e.currentTarget.style.color =
                            "var(--theme-iconColor)";
                        }}
                        title="Rename chat"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                        style={{
                          padding: "6px",
                          borderRadius: "6px",
                          background: "var(--theme-iconBg)",
                          color: "var(--theme-error)",
                          border: "none",
                          cursor: "pointer",
                          transition: "var(--theme-transition)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "var(--theme-error)";
                          e.currentTarget.style.color = "#ffffff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "var(--theme-iconBg)";
                          e.currentTarget.style.color = "var(--theme-error)";
                        }}
                        title="Delete chat"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Section */}
        <div
          className="p-2 md:p-4"
          style={{
            borderTop: "1px solid var(--theme-borderColor)",
            background: "var(--theme-surface-bg)",
          }}
        >
          {userInfo ? (
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: `linear-gradient(135deg, var(--theme-sendButtonBg) 0%, var(--theme-sendButtonHover) 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "2px solid var(--theme-borderColor)",
                }}
              >
                {getUserInitials(userInfo.name)}
              </div>

              {/* User Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--theme-text)",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {userInfo.name?.charAt(0).toUpperCase() +
                    userInfo.name?.slice(1) || "User"}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--theme-text-secondary)",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {userInfo.email}
                </p>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  background: "var(--theme-iconBg)",
                  color: "var(--theme-iconColor)",
                  border: "none",
                  cursor: "pointer",
                  transition: "var(--theme-transition)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--theme-error)";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--theme-iconBg)";
                  e.currentTarget.style.color = "var(--theme-iconColor)";
                }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "var(--theme-text-secondary)",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "var(--theme-iconBg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <User size={20} style={{ color: "var(--theme-iconColor)" }} />
              </div>
              <span style={{ fontSize: "14px" }}>Loading...</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
