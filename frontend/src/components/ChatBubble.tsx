

import React, { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Volume2, User, VolumeOff, Link } from "lucide-react";
import { Message } from "../types";
import classNames from "classnames";
import CitationCard from "./CitationCard";

import LogoBlack from "../asset/img/bharat5.png";
import LogoWhite from "../asset/img/bharat5.png";
import { useThemeMode } from "../context/ThemeContext";
import { useVoice } from "../hooks/useVoice";


interface ChatBubbleProps {
  message: Message;
  onCopy: (text: string) => void;
  onSpeak: (text: string) => void;
  onStopSpeaking: () => void;
  onRegenerate?: () => void;
  showRegenerate?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onCopy }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isUser = message.role === "user";
  const [showSources, setShowSources] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { ttsState, speak, stopSpeaking } = useVoice();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    onCopy("Message copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  const handleSpeakToggle = async (text: string) => {
    console.log("🔊 handleSpeakToggle called with:", text);

    if (!text.trim() || !ttsState.isEnabled) return;

    // ⏹ If already speaking → stop
    if (ttsState.isSpeaking) {
      stopSpeaking();
      return;
    }

    // ⏳ If loading → ignore clicks
    if (ttsState.isLoading) return;

    // 🔊 Start speaking
    await speak(text);
  };

  const { resolvedMode } = useThemeMode();
  const logoSrc = resolvedMode === "dark" ? LogoWhite : LogoBlack;

  const ActionButton = ({
    onClick,
    title,
    children,
    variant = "default",
  }: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    variant?: "default" | "success" | "danger";
  }) => (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: "8px",
        borderRadius: "8px",
        background: "var(--theme-iconBg)",
        color:
          variant === "success"
            ? "var(--theme-success)"
            : variant === "danger"
            ? "var(--theme-error)"
            : "var(--theme-iconColor)",
        border: "1px solid var(--theme-borderColor)",
        cursor: "pointer",
        transition: "var(--theme-transition)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={(e) => {
        const bgColor =
          variant === "success"
            ? "var(--theme-success)"
            : variant === "danger"
            ? "var(--theme-error)"
            : "var(--theme-iconHover)";
        e.currentTarget.style.background = bgColor;
        e.currentTarget.style.color = "#ffffff";
        e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--theme-iconBg)";
        e.currentTarget.style.color =
          variant === "success"
            ? "var(--theme-success)"
            : variant === "danger"
            ? "var(--theme-error)"
            : "var(--theme-iconColor)";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {children}
    </button>
  );

  return (
    <div
      className={classNames("flex mb-6", {
        "justify-end": isUser,
        "justify-start": !isUser,
      })}
    >
      <div className="max-w-4xl w-full px-4">
        <div
          className={classNames("flex gap-4", {
            "flex-row-reverse": isUser,
            "flex-row": !isUser,
          })}
        >
          {/* Avatar - hidden on mobile */}
          <div
            className="hidden md:flex flex-shrink-0"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              alignItems: "center",
              justifyContent: "center",
              background: isUser
                ? `linear-gradient(135deg, var(--theme-sendButtonBg) 0%, var(--theme-sendButtonHover) 100%)`
                : "var(--theme-surface-bg)",
              border: "2px solid var(--theme-borderColor)",
              boxShadow: `0 4px 12px var(--theme-shadow)`,
            }}
          >
            {isUser ? (
              <User size={20} style={{ color: "#ffffff" }} />
            ) : (
              <img
                src={logoSrc}
                alt="BharatShodh"
                className="w-8 h-8 rounded-lg"
              />
            )}
          </div>

          {/* Content */}
          <div className=" min-w-0">
            {/* Header with name and actions */}
            <div
              className={classNames("flex items-center gap-3 mb-3", {
                "justify-end": isUser,
                "justify-start": !isUser,
              })}
            >
              <div
                className="font-semibold text-sm"
                style={{ color: "var(--theme-text)" }}
              >
                {isUser ? "" : ""}
              </div>

              {/* Action buttons - hidden on mobile */}
              <div className="hidden md:flex items-center gap-2 opacity-100 transition-opacity">
                <ActionButton
                  onClick={handleCopy}
                  title={copied ? "Copied!" : "Copy message"}
                  variant={copied ? "success" : "default"}
                >
                  <Copy size={14} />
                </ActionButton>
                {!isUser && (
                  <ActionButton
                    onClick={() => handleSpeakToggle(message.content)}
                    title={
                      ttsState.isLoading
                        ? "Preparing audio"
                        : ttsState.isSpeaking
                        ? "Stop audio"
                        : "Read aloud"
                    }
                    disabled={!ttsState.isEnabled || ttsState.isLoading}
                  >
                    {ttsState.isLoading ? (
                      <div
                        style={{
                          width: "14px",
                          height: "14px",
                          border: "2px solid var(--theme-iconColor)",
                          borderTop: "2px solid transparent",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    ) : ttsState.isSpeaking ? (
                      <VolumeOff size={14} />
                    ) : (
                      <Volume2 size={14} />
                    )}
                  </ActionButton>
                )}

                {/* Sources button */}
                {!isUser && message.sources && message.sources.length > 0 && (
                  <div className="relative">
                    <ActionButton
                      onClick={() => setShowSources(!showSources)}
                      title="View sources"
                    >
                      <Link size={14} />
                    </ActionButton>

                    {showSources && (
                      <div
                        className="absolute z-50 top-full mt-2 right-0 md:left-0 lg:left-0 w-[260px] md:w-[360px] lg:w-[360px]"
                        style={{
                          maxHeight: "300px",
                          overflowY: "auto",
                          background: "var(--theme-surface-bg)",
                          borderRadius: "12px",
                          padding: "16px",
                          border: "1px solid var(--theme-borderColor)",
                          boxShadow: `0 8px 32px var(--theme-shadow)`,
                          backdropFilter: "blur(20px)",
                          WebkitBackdropFilter: "blur(20px)",
                        }}
                      >
                        <h4
                          style={{
                            color: "var(--theme-text)",
                            fontSize: "14px",
                            fontWeight: "600",
                            marginBottom: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          🌐 Sources
                        </h4>
                        {message.sources.map((src, index) => (
                          <div key={index} style={{ marginBottom: "12px" }}>
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "var(--theme-sendButtonBg)",
                                textDecoration: "none",
                                fontSize: "13px",
                                fontWeight: "500",
                                display: "block",
                                marginBottom: "4px",
                                wordBreak: "break-word",
                              }}
                              onM ouseEnter={(e) => {
                                e.currentTarget.style.textDecoration =
                                  "underline";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = "none";
                              }}
                            >
                              {src.title || src.name || src.url}
                            </a>
                            <p
                              style={{
                                color: "var(--theme-text-secondary)",
                                fontSize: "12px",
                                margin: 0,
                                lineHeight: "1.4",
                              }}
                            >
                              {src.snippet}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Message content */}
            <div className="group">
              <div
                style={{
                  background: isUser
                    ? "var(--theme-chatBubble)"
                    : "var(--theme-surface-bg)",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  border: "1px solid var(--theme-borderColor)",
                  boxShadow: `0 2px 8px var(--theme-shadow)`,
                  position: "relative",
                  textAlign: isUser ? "right" : "left",
                }}
              >
                {message.isLoading ? (
                  <div
                    className="flex items-center gap-3"
                    style={{ color: "var(--theme-text-secondary)" }}
                  >
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "var(--theme-iconColor)",
                            animation: `bounce 1.4s ease-in-out infinite`,
                            animationDelay: `${i * 0.16}s`,
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: "14px" }}>AI is thinking...</span>
                  </div>
                ) : (
                  <>
                    {/* File preview */}
                    {message.file && (
                      <div style={{ marginBottom: "16px" }}>
                        {message.fileType?.startsWith("image/") ? (
                          <img
                            src={
                              message.file instanceof File
                                ? URL.createObjectURL(message.file)
                                : message.file.url?.startsWith("http")
                                ? message.file.url
                                : `https://bharatshodh.com${message.file.url}`
                            }
                            alt={message.fileName}
                            style={{
                              borderRadius: "12px",
                              maxWidth: "300px",
                              width: "100%",
                              height: "auto",
                              border: "1px solid var(--theme-borderColor)",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              padding: "12px 16px",
                              borderRadius: "8px",
                              background: "var(--theme-iconBg)",
                              border: "1px solid var(--theme-borderColor)",
                              fontSize: "14px",
                            }}
                          >
                            📄{" "}
                            <strong style={{ color: "var(--theme-text)" }}>
                              {message.fileName}
                            </strong>
                            <div
                              style={{
                                color: "var(--theme-text-secondary)",
                                fontSize: "12px",
                                marginTop: "4px",
                              }}
                            >
                              Ready for analysis
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message text */}
                    {isUser ? (
                      <div
                        style={{
                          color: "var(--theme-text)",
                          fontSize: "15px",
                          lineHeight: "1.6",
                          whiteSpace: "pre-wrap",
                          textAlign: "right",
                          userSelect: "text",
                        }}
                        onContextMenu={(e) => {
                          // Long press on mobile
                          if (window.innerWidth < 768) {
                            e.preventDefault();
                            navigator.clipboard.writeText(message.content);
                            setCopied(true);
                            onCopy("Message copied!");
                            setTimeout(() => setCopied(false), 2000);
                          }
                        }}
                        onTouchStart={() => {
                          if (window.innerWidth < 768) {
                            const timer = setTimeout(() => {
                              navigator.clipboard.writeText(message.content);
                              setCopied(true);
                              onCopy("Message copied!");
                              setTimeout(() => setCopied(false), 2000);
                            }, 800);
                            // Store timer to clear on touch end
                            (window as any)._longPressTimer = timer;
                          }
                        }}
                        onTouchEnd={() => {
                          if ((window as any)._longPressTimer) {
                            clearTimeout((window as any)._longPressTimer);
                          }
                        }}
                      >
                        {!message.content?.includes(" Document:") &&
                          !message.content?.startsWith("Image uploaded:") &&
                          message.content}
                      </div>
                    ) : (
                      <div
                        className="prose prose-invert max-w-none"
                        style={{ color: "var(--theme-text)" }}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code: ({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                            }) => {
                              const match = /language-(\w+)/.exec(
                                className || ""
                              );
                              return !inline && match ? (
                                <pre
                                  style={{
                                    background: "var(--theme-iconBg)",
                                    borderRadius: "8px",
                                    padding: "16px",
                                    border:
                                      "1px solid var(--theme-borderColor)",
                                    overflowX: "auto",
                                    fontSize: "14px",
                                  }}
                                >
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              ) : (
                                <code
                                  style={{
                                    background: "var(--theme-iconBg)",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    fontSize: "13px",
                                    border:
                                      "1px solid var(--theme-borderColor)",
                                  }}
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                            p: ({ children }) => (
                              <p
                                style={{
                                  color: "var(--theme-text)",
                                  lineHeight: "1.6",
                                  marginBottom: "12px",
                                }}
                              >
                                {children}
                              </p>
                            ),
                            ul: ({ children }) => (
                              <ul
                                style={{
                                  color: "var(--theme-text)",
                                  paddingLeft: "20px",
                                }}
                              >
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol
                                style={{
                                  color: "var(--theme-text)",
                                  paddingLeft: "20px",
                                }}
                              >
                                {children}
                              </ol>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>

                        {/* RAG Document Citations */}
                        {!isUser && message.citations && message.citations.length > 0 && (
                          <CitationCard citations={message.citations} />
                        )}

                        {/* References */}
                        {!isUser &&
                          message.references &&
                          message.references.length > 0 && (
                            <div
                              style={{
                                marginTop: "20px",
                                paddingTop: "16px",
                                borderTop: "1px solid var(--theme-borderColor)",
                                fontSize: "13px",
                              }}
                            >
                              <div
                                style={{
                                  color: "var(--theme-text)",
                                  fontWeight: "600",
                                  marginBottom: "8px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                📚 References
                              </div>
                              <ul
                                style={{
                                  listStyle: "none",
                                  padding: 0,
                                  margin: 0,
                                }}
                              >
                                {message.references.map((ref, index) => (
                                  <li
                                    key={index}
                                    style={{ marginBottom: "8px" }}
                                  >
                                    <a
                                      href={ref.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: "var(--theme-sendButtonBg)",
                                        textDecoration: "none",
                                        fontWeight: "500",
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.textDecoration =
                                          "underline";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.textDecoration =
                                          "none";
                                      }}
                                    >
                                      {ref.title}
                                    </a>
                                    <span
                                      style={{
                                        color: "var(--theme-text-secondary)",
                                        marginLeft: "8px",
                                      }}
                                    >
                                      – {ref.snippet}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Mobile action icons - below AI response only */}
              {!isUser && (
                <div className="md:hidden flex items-center gap-2 mt-3">
                  <button
                    onClick={handleCopy}
                    title={copied ? "Copied!" : "Copy"}
                    style={{
                      padding: "6px",
                      borderRadius: "6px",
                      background: "var(--theme-iconBg)",
                      color: copied ? "var(--theme-success)" : "var(--theme-iconColor)",
                      border: "1px solid var(--theme-borderColor)",
                      cursor: "pointer",
                      transition: "var(--theme-transition)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={() => handleSpeakToggle(message.content)}
                    title={
                      ttsState.isLoading
                        ? "Loading"
                        : ttsState.isSpeaking
                        ? "Stop"
                        : "Read"
                    }
                    disabled={!ttsState.isEnabled || ttsState.isLoading}
                    style={{
                      padding: "6px",
                      borderRadius: "6px",
                      background: "var(--theme-iconBg)",
                      color: "var(--theme-iconColor)",
                      border: "1px solid var(--theme-borderColor)",
                      cursor: "pointer",
                      transition: "var(--theme-transition)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {ttsState.isLoading ? (
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          border: "2px solid var(--theme-iconColor)",
                          borderTop: "2px solid transparent",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    ) : ttsState.isSpeaking ? (
                      <VolumeOff size={12} />
                    ) : (
                      <Volume2 size={12} />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
            opacity: 0.5;
          } 
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatBubble;
