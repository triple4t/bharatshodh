import React from "react";
import { Menu, MessageSquare, Sparkles } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  currentChatTitle?: string;
}

const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  currentChatTitle,
}) => {
  return (
    <header
      className="md:hidden px-4 py-3 flex items-center justify-between relative"
      style={{
        background: "var(--theme-surface-bg)",
        borderBottom: "1px solid var(--theme-borderColor)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* Menu Button */}
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        style={{
          padding: "10px",
          borderRadius: "12px",
          background: "var(--theme-iconBg)",
          color: "var(--theme-iconColor)",
          border: "1px solid var(--theme-borderColor)",
          cursor: "pointer",
          transition: "var(--theme-transition)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--theme-iconHover)";
          e.currentTarget.style.color = "#ffffff";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--theme-iconBg)";
          e.currentTarget.style.color = "var(--theme-iconColor)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <Menu size={20} />
      </button>

      {/* Center - Chat Title */}
      <div
        className="flex items-center gap-3 flex-1 justify-center mx-4 mr-10"
        // style={{ maxWidth: "200px" }}
      >
        <div
          style={{
            padding: "8px",
            borderRadius: "10px",
            background: `linear-gradient(135deg, var(--theme-sendButtonBg) 0%, var(--theme-sendButtonHover) 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MessageSquare size={16} style={{ color: "#ffffff" }} />
        </div>
        <div>
          <h1
            style={{
              color: "var(--theme-text)",
              fontSize: "16px",
              fontWeight: "600",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: "1.2",
            }}
          >
            {currentChatTitle || "New Chat"}
          </h1>
          <p
            style={{
              color: "var(--theme-text-secondary)",
              fontSize: "12px",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Sparkles size={10} />
            BharatShodh
          </p>
        </div>
      </div>

      {/* Right spacer for balance */}
      <div style={{ width: "42px" }} />
    </header>
  );
};

export default Header;
