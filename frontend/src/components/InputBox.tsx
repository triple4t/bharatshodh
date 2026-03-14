import React, { useState } from "react";
import { Send, Mic, MicOff, Paperclip, Globe, X, FileText } from "lucide-react";
import { useVoice } from "../hooks/useVoice";
import { useLanguage } from "../context/LanguageContext";

interface InputBoxProps {
  onSendMessage: (message: string, file?: File, useWebSearch?: boolean, useDocuments?: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  showFileUpload?: boolean;
  showVoiceInput?: boolean;
  showWebSearch?: boolean;
}

const InputBox: React.FC<InputBoxProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Ask me anything...",
  showFileUpload = true,
  showVoiceInput = true,
  showWebSearch = true,
}) => {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [useDocuments, setUseDocuments] = useState(false); // NEW: Document RAG toggle
  const { voiceState, startListening, stopListening } = useVoice();
  const { t } = useLanguage();

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  // Handle voice transcript
  React.useEffect(() => {
    if (voiceState.transcript) {
      setInput(voiceState.transcript);
      adjustTextareaHeight();
    }
  }, [voiceState.transcript]);

  // Handle send message
  const handleSend = () => {
    const message = input.trim();
    if (!message && !selectedFile) return;

    onSendMessage(message, selectedFile || undefined, useWebSearch, useDocuments); // Pass useDocuments
    setInput("");
    setSelectedFile(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    // Stop voice after sending
    if (voiceState.isListening) stopListening();
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Toggle voice recognition
  const handleVoiceToggle = () => {
    if (voiceState.isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Main Input Container */}
        <div
          style={{
            background: "var(--theme-surface-bg)",
            borderRadius: "20px",
            border: "2px solid var(--theme-borderColor)",
            boxShadow: "0 8px 32px var(--theme-shadow)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* File Preview */}
          {selectedFile && (
            <div style={{ margin: "16px 16px 0", padding: "12px", borderRadius: "12px", background: "var(--theme-iconBg)", display: "flex", alignItems: "center", gap: "12px" }}>
              <Paperclip size={16} style={{ color: "var(--theme-iconColor)" }} />
              <span style={{ color: "var(--theme-text)", fontSize: "14px", flex: 1 }}>{selectedFile.name}</span>
              <button onClick={() => setSelectedFile(null)} style={{ background: "none", border: "none", color: "var(--theme-error)", cursor: "pointer" }}>
                <X size={16} />
              </button>
            </div>
          )}

          {/* Input Area */}
          <div style={{ padding: "12px" }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                color: "var(--theme-text)",
                fontSize: "16px",
                lineHeight: "1.5",
                minHeight: "24px",
                maxHeight: "200px",
              }}
            />
          </div>

          {/* Controls Row */}
          <div style={{ padding: "0 12px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {/* Left Controls */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {/* File Upload */}
              {showFileUpload && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: "8px",
                      borderRadius: "10px",
                      background: "var(--theme-iconBg)",
                      color: "var(--theme-iconColor)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title={t("attach.file")}
                  >
                    <Paperclip size={20} />
                  </button>
                  <input ref={fileInputRef} type="file" onChange={handleFileSelect} style={{ display: "none" }} accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif" />
                </>
              )}

              {/* Mic Button */}
              {showVoiceInput && voiceState.isSupported && (
                <button
                  onClick={handleVoiceToggle}
                  style={{
                    padding: "8px",
                    borderRadius: "10px",
                    background: "var(--theme-iconBg)",
                    color: voiceState.isListening ? "red" : "var(--theme-iconColor)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title={voiceState.isListening ? t("stop.voice") : t("start.voice")}
                >
                  {voiceState.isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              )}

              {/* Web Search Toggle */}
              {showWebSearch && (
                <button
                  onClick={() => setUseWebSearch((prev) => !prev)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    borderRadius: "20px",
                    background: useWebSearch ? "var(--theme-success)" : "var(--theme-iconBg)",
                    color: useWebSearch ? "#fff" : "var(--theme-iconColor)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                  title={t("search.web.tooltip")}
                >
                  <Globe size={16} />
                  <span>{t("search.web")}</span>
                </button>
              )}

              {/* Document RAG Toggle - NEW! */}
              <button
                onClick={() => setUseDocuments((prev) => !prev)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 12px",
                  borderRadius: "20px",
                  background: useDocuments ? "#7c3aed" : "var(--theme-iconBg)",
                  color: useDocuments ? "#fff" : "var(--theme-iconColor)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                title={t("docs.rag.tooltip")}
              >
                <FileText size={16} />
                <span>{t("docs.rag")}</span>
              </button>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={disabled || (!input.trim() && !selectedFile)}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                background: !disabled && (input.trim() || selectedFile) ? "var(--theme-success)" : "var(--theme-iconBg)",
                color: !disabled && (input.trim() || selectedFile) ? "#fff" : "var(--theme-iconColor)",
                border: "none",
                cursor: disabled || (!input.trim() && !selectedFile) ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
              }}
              title={t("send.message")}
            >
              <Send size={20} />
            </button>
          </div>
        </div>

        {/* Document Mode Indicator */}
        {useDocuments && (
          <div style={{
            marginTop: "8px",
            padding: "8px 12px",
            borderRadius: "8px",
            background: "#7c3aed20",
            color: "#7c3aed",
            fontSize: "13px",
            textAlign: "center",
          }}>
            {t("docs.mode.active")}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputBox;
