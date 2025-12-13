import React, { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";
import { Message } from "../types";
import { enhanceMessagesWithSources } from "../utils/messageEnhancer";
import { Sparkles, Bot } from "lucide-react";

interface ChatWindowProps {
  messages: Message[];
  onCopy: (text: string) => void;
  onSpeak: (text: string) => void;
  onStopSpeaking: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onCopy,
  onSpeak,
  onStopSpeaking,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const enhancedMessages = enhanceMessagesWithSources(messages).filter(
    (msg) => msg.role !== "system"
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-y-auto overflow-x-hidden">
        <div className="text-center max-w-lg mx-auto mt-4 md:mt-32 lg:mt-32">
          {/* AI Avatar */}
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "20px",
              background: `linear-gradient(135deg, var(--theme-sendButtonBg) 0%, var(--theme-sendButtonHover) 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto",
              boxShadow: `0 8px 32px var(--theme-shadow)`,
              position: "relative",
            }}
            className="md:w-[80px] md:h-[80px] md:rounded-[24px] md:mb-[24px]"
          >
            <Bot size={32} style={{ color: "#ffffff" }} className="md:w-[40px] md:h-[40px]" />
            <div
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "var(--theme-success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--theme-background)",
              }}
              className="md:w-[24px] md:h-[24px]"
            >
              <Sparkles size={10} style={{ color: "#ffffff" }} className="md:w-[12px] md:h-[12px]" />
            </div>
          </div>

          {/* Welcome Message */}
          <div
            style={{
              background: "var(--theme-surface-bg)",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid var(--theme-borderColor)",
              boxShadow: `0 8px 32px var(--theme-shadow)`,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              marginBottom: "16px",
            }}
            className="md:rounded-[20px] md:p-[32px] md:mb-[24px]"
          >
            <h2
              style={{
                color: "var(--theme-text)",
                fontSize: "22px",
                fontWeight: "700",
                margin: "0 0 8px 0",
                background:
                  "linear-gradient(135deg, var(--theme-text) 0%, var(--theme-sendButtonBg) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              className="md:text-[28px] md:mb-[12px]"
            >
              How can I help you today?
            </h2>
            <p
              style={{
                color: "var(--theme-text-secondary)",
                fontSize: "14px",
                margin: 0,
                lineHeight: "1.5",
              }}
              className="md:text-[16px]"
            >
              I'm here to assist you with questions, creative tasks, analysis,
              and more. Start a conversation below!
            </p>
          </div>

          {/* Quick Start Suggestions */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
              maxWidth: "600px",
              margin: "0 auto",
            }}
            className="md:grid-cols-2 md:gap-[12px]"
          >
            {[
              {
                icon: "💡",
                title: "Get Ideas",
                desc: "Brainstorm creative solutions",
              },
              {
                icon: "📊",
                title: "Analyze Data",
                desc: "Review and interpret information",
              },
              {
                icon: "✍️",
                title: "Write Content",
                desc: "Create articles, emails, and more",
              },
              {
                icon: "🔍",
                title: "Research Topics",
                desc: "Find and summarize information",
              },
            ].map((suggestion, index) => (
              <div
                key={index}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: "var(--theme-iconBg)",
                  border: "1px solid var(--theme-borderColor)",
                  textAlign: "center",
                  transition: "var(--theme-transition)",
                  cursor: "pointer",
                }}
                className="md:p-[16px] md:rounded-[12px]"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--theme-surface-bg)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 4px 16px var(--theme-shadow)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--theme-iconBg)";
                  e.currentTarget.style.transform = "translateY(0px)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "20px", marginBottom: "6px" }} className="md:text-[24px] md:mb-[8px]">
                  {suggestion.icon}
                </div>
                <h3
                  style={{
                    color: "var(--theme-text)",
                    fontSize: "13px",
                    fontWeight: "600",
                    margin: "0 0 3px 0",
                  }}
                  className="md:text-[14px] md:mb-[4px]"
                >
                  {suggestion.title}
                </h3>
                <p
                  style={{
                    color: "var(--theme-text-secondary)",
                    fontSize: "11px",
                    margin: 0,
                    lineHeight: "1.3",
                  }}
                  className="md:text-[12px]"
                >
                  {suggestion.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto overflow-x-hidden"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "var(--theme-iconColor) transparent",
        minHeight: 0, // Important for flex child
        height: "100%", // Fill available space
        WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
        paddingBottom: "100px", // Space for InputBox
      }}
    >
      <div className="w-full">
        <div style={{ paddingTop: "20px" }}>
          {enhancedMessages.map((message, index) => (
            <ChatBubble
              key={message.id}
              message={message}
              onCopy={onCopy}
              onSpeak={onSpeak}
              onStopSpeaking={onStopSpeaking}
              showRegenerate={
                index === enhancedMessages.length - 1 &&
                message.role === "assistant"
              }
            />
          ))}
        </div>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} style={{ height: "20px" }} />
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        /* Webkit browsers */
        .flex-1::-webkit-scrollbar {
          width: 6px;
        }
        
        .flex-1::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .flex-1::-webkit-scrollbar-thumb {
          background: var(--theme-iconColor);
          border-radius: 3px;
        }
        
        .flex-1::-webkit-scrollbar-thumb:hover {
          background: var(--theme-iconHover);
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;
