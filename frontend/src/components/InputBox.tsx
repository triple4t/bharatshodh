// import React, { useState, useRef } from "react";
// import { Send, Mic, MicOff, Paperclip, Globe, X } from "lucide-react";
// import { useVoice } from "../hooks/useVoice";

// interface InputBoxProps {
//   onSendMessage: (message: string, file?: File, useWebSearch?: boolean) => void;
//   disabled?: boolean;
//   placeholder?: string;
//   showFileUpload?: boolean;
//   showVoiceInput?: boolean;
//   showWebSearch?: boolean;
// }

// const InputBox: React.FC<InputBoxProps> = ({
//   onSendMessage,
//   disabled = false,
//   placeholder = "Message ChatGPT...",
//   showFileUpload = true,
//   showVoiceInput = true,
//   showWebSearch = true,
// }) => {
//   const [input, setInput] = useState("");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [useWebSearch, setUseWebSearch] = useState(false);

//   const { voiceState, startListening, stopListening } = useVoice();

//   // Auto-resize textarea
//   const adjustTextareaHeight = () => {
//     const textarea = textareaRef.current;
//     if (textarea) {
//       textarea.style.height = "auto";
//       textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
//     }
//   };

//   // Handle input change
//   const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setInput(e.target.value);
//     adjustTextareaHeight();
//   };

//   // Handle voice transcript
//   React.useEffect(() => {
//     if (voiceState.transcript) {
//       setInput(voiceState.transcript);
//       adjustTextareaHeight();
//     }
//   }, [voiceState.transcript]);

//   // Handle send message
//   const handleSend = () => {
//     const message = input.trim();
//     if (!message && !selectedFile) return;

//     onSendMessage(message, selectedFile || undefined, useWebSearch);
//     setInput("");
//     setSelectedFile(null);

//     // Reset textarea height
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//     }
//   };

//   // Handle key press
//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   // Handle file selection
//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setSelectedFile(file);
//     }
//   };

//   // Toggle voice recognition
//   const handleVoiceToggle = () => {
//     if (voiceState.isListening) {
//       stopListening();
//     } else {
//       startListening();
//     }
//   };

//   return (
//     <div
//       className="border-t px-4 py-4 rounded-[28px]"
//       style={{
//         background: "var(--theme-chatBubble, #212121)",
//         borderTop: "1px solid var(--theme-inputBorder, #ffffff0d)",
//         color: "var(--theme-inputText, var(--theme-fontColor, #f3f3f3))",
//       }}
//     >
//       <div className="max-w-4xl mx-auto">
//         {/* File preview */}
//         {selectedFile && (
//           <div
//             className="flex items-center gap-2 px-3 py-2 rounded-lg"
//             style={{ background: "var(--theme-inputFileBg, #ffffff0d)" }}
//           >
//             <Paperclip
//               size={16}
//               style={{ color: "var(--theme-inputFileIcon, #afafaf)" }}
//             />
//             <span
//               className="text-sm flex-1 truncate"
//               style={{ color: "var(--theme-inputFileText, #f3f3f3)" }}
//             >
//               {selectedFile.name}
//             </span>
//             <button
//               onClick={() => setSelectedFile(null)}
//               className="transition-colors"
//               style={{ color: "var(--theme-inputFileIcon, #afafaf)" }}
//             >
//               ×
//             </button>
//           </div>
//         )}

//         {/* Row 1: Textarea */}
//         <div className="relative">
//           <textarea
//             ref={textareaRef}
//             value={input}
//             onChange={handleInputChange}
//             onKeyDown={handleKeyDown}
//             placeholder={placeholder}
//             disabled={disabled}
//             className="w-full bg-transparent border-none rounded-xl px-2 py-1 resize-none outline-none"
//             style={{
//               color: "var(--theme-inputText, var(--theme-fontColor, #f3f3f3))",
//               background: "transparent",
//               border: "none",
//             }}
//           />

//           {/* Voice listening indicator */}
//           {voiceState.isListening && (
//             <div className="absolute top-3 right-3 flex items-center gap-1">
//               <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
//               <span
//                 style={{ color: "var(--theme-inputMuted, #afafaf)" }}
//                 className="text-xs"
//               >
//                 Listening...
//               </span>
//             </div>
//           )}
//         </div>

//         {/* Row 2: Buttons */}
//         <div className="flex items-center justify-between gap-2">
//           {/* Left side: File + Mic */}
//           <div className="flex items-center gap-2">
//             {/* File Button */}
//             {showFileUpload && (
//               <>
//                 <button
//                   onClick={() => fileInputRef.current?.click()}
//                   className="p-2 rounded-lg transition-colors"
//                   title="Attach file"
//                   style={{
//                     color: "var(--theme-iconColor, #afafaf)",
//                     background: "var(--theme-iconBg, #ffffff0d)",
//                   }}
//                 >
//                   <Paperclip size={20} />
//                 </button>

//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   onChange={handleFileSelect}
//                   className="hidden"
//                   accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
//                 />
//               </>
//             )}
//             {/* Mic Button */}
//             {showVoiceInput && voiceState.isSupported && (
//               <button
//                 onClick={handleVoiceToggle}
//                 className="p-2 rounded-lg transition-colors"
//                 title={
//                   voiceState.isListening
//                     ? "Stop listening"
//                     : "Start voice input"
//                 }
//                 style={{
//                   color: voiceState.isListening
//                     ? "red"
//                     : "var(--theme-iconColor, #afafaf)",
//                   background: "var(--theme-iconBg, #ffffff0d)",
//                 }}
//               >
//                 {voiceState.isListening ? (
//                   <MicOff size={20} />
//                 ) : (
//                   <Mic size={20} />
//                 )}
//               </button>
//             )}
//             {showWebSearch && (
//               <button
//                 type="button"
//                 onClick={() => setUseWebSearch((prev) => !prev)}
//                 className="flex items-center gap-1 px-3 py-1 rounded-full border transition-colors duration-200"
//                 style={{
//                   color: "var(--theme-iconColor, #99ceff)",
//                   background: useWebSearch
//                     ? "var(--theme-iconBgActive, #3b4045)"
//                     : "var(--theme-iconBg, #ffffff0d)",
//                 }}
//               >
//                 <Globe size={16} />
//                 <span className="text-sm">Search</span>
//                 {useWebSearch && <X size={14} />}
//               </button>
//             )}
//           </div>

//           {/* Right side: Send Button */}
//           <button
//             onClick={handleSend}
//             disabled={disabled || (!input.trim() && !selectedFile)}
//             className="p-2 rounded-lg transition-colors"
//             title="Send message"
//             style={{
//               background:
//                 !disabled && (input.trim() || selectedFile)
//                   ? "var(--theme-iconBgActive, var(--theme-sendButtonBg, #7ab7ff))"
//                   : "var(--theme-iconBg, #ffffff0d)",
//               color:
//                 !disabled && (input.trim() || selectedFile)
//                   ? "#fff"
//                   : "var(--theme-iconColor, #afafaf)",
//               cursor:
//                 disabled || (!input.trim() && !selectedFile)
//                   ? "not-allowed"
//                   : "pointer",
//             }}
//           >
//             <Send size={20} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InputBox;

// import React, { useState, useRef } from "react";
// import { Send, Mic, MicOff, Paperclip, Globe, X } from "lucide-react";
// import { useVoice } from "../hooks/useVoice";

// interface InputBoxProps {
//   onSendMessage: (message: string, file?: File, useWebSearch?: boolean) => void;
//   disabled?: boolean;
//   placeholder?: string;
//   showFileUpload?: boolean;
//   showVoiceInput?: boolean;
//   showWebSearch?: boolean;
// }

// const InputBox: React.FC<InputBoxProps> = ({
//   onSendMessage,
//   disabled = false,
//   placeholder = "Ask me anything...",
//   showFileUpload = true,
//   showVoiceInput = true,
//   showWebSearch = true,
// }) => {
//   const [input, setInput] = useState("");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [useWebSearch, setUseWebSearch] = useState(false);

//   const { voiceState, startListening, stopListening } = useVoice();

//   // Auto-resize textarea
//   const adjustTextareaHeight = () => {
//     const textarea = textareaRef.current;
//     if (textarea) {
//       textarea.style.height = "auto";
//       textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
//     }
//   };

//   // Handle input change
//   const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setInput(e.target.value);
//     adjustTextareaHeight();
//   };

//   // Handle voice transcript
//   React.useEffect(() => {
//     if (voiceState.transcript) {
//       setInput(voiceState.transcript);
//       adjustTextareaHeight();
//     }
//   }, [voiceState.transcript]);

//   // Handle send message
//   const handleSend = () => {
//     const message = input.trim();
//     if (!message && !selectedFile) return;

//     onSendMessage(message, selectedFile || undefined, useWebSearch);
//     setInput("");
//     setSelectedFile(null);
//     setUseWebSearch(false);

//     // Reset textarea height
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//     }
//     // Stop voice after sending
//     if (voiceState.isListening) stopListening();
//   };

//   // Handle key press
//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   // Handle file selection
//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setSelectedFile(file);
//     }
//   };

//   // Toggle voice recognition
//   const handleVoiceToggle = () => {
//     if (voiceState.isListening) {
//       stopListening();
//     } else {
//       startListening();
//     }
//   };

//   return (
//     <div
//       className="border-t px-4 py-4 rounded-[28px] md:mx-24 lg:mx-48 sm:mx-12"
//       style={{
//         background: "var(--theme-chatBubble, #212121)",
//         borderTop: "1px solid var(--theme-inputBorder, #ffffff0d)",
//         color: "var(--theme-inputText, var(--theme-fontColor, #f3f3f3))",
//       }}
//     >
//       <div className="max-w-4xl mx-auto">
//         {/* File preview */}
//         {selectedFile && (
//           <div
//             className="flex items-center gap-2 px-3 py-2 rounded-lg"
//             style={{ background: "var(--theme-inputFileBg, #ffffff0d)" }}
//           >
//             <Paperclip
//               size={16}
//               style={{ color: "var(--theme-inputFileIcon, #afafaf)" }}
//             />
//             <span
//               className="text-sm flex-1 truncate"
//               style={{ color: "var(--theme-inputFileText, #f3f3f3)" }}
//             >
//               {selectedFile.name}
//             </span>
//             <button
//               onClick={() => setSelectedFile(null)}
//               className="transition-colors"
//               style={{ color: "var(--theme-inputFileIcon, #afafaf)" }}
//             >
//               ×
//             </button>
//           </div>
//         )}

//         {/* Row 1: Textarea */}
//         <div className="relative">
//           <textarea
//             ref={textareaRef}
//             value={input}
//             onChange={handleInputChange}
//             onKeyDown={handleKeyDown}
//             placeholder={placeholder}
//             disabled={disabled}
//             className="w-full bg-transparent border-none rounded-xl px-2 py-1 resize-none outline-none"
//             style={{
//               color: "var(--theme-inputText, var(--theme-fontColor, #f3f3f3))",
//               background: "transparent",
//               border: "none",
//             }}
//           />

//           {/* Voice listening indicator */}
//           {voiceState.isListening && (
//             <div className="absolute top-3 right-3 flex items-center gap-1">
//               <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
//               <span
//                 style={{ color: "var(--theme-inputMuted, #afafaf)" }}
//                 className="text-xs"
//               >
//                 Listening...
//               </span>
//             </div>
//           )}
//         </div>

//         {/* Row 2: Buttons */}
//         <div className="flex items-center justify-between gap-2">
//           {/* Left side: File + Mic */}
//           <div className="flex items-center gap-2">
//             {/* File Button */}
//             {showFileUpload && (
//               <>
//                 <button
//                   onClick={() => fileInputRef.current?.click()}
//                   className="p-2 rounded-lg transition-colors"
//                   title="Attach file"
//                   style={{
//                     color: "var(--theme-iconColor, #afafaf)",
//                     background: "var(--theme-iconBg, #ffffff0d)",
//                   }}
//                 >
//                   <Paperclip size={20} />
//                 </button>

//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   onChange={handleFileSelect}
//                   className="hidden"
//                   accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
//                 />
//               </>
//             )}
//             {/* Mic Button */}
//             {showVoiceInput && voiceState.isSupported && (
//               <button
//                 onClick={handleVoiceToggle}
//                 className="p-2 rounded-lg transition-colors"
//                 title={
//                   voiceState.isListening
//                     ? "Stop listening"
//                     : "Start voice input"
//                 }
//                 style={{
//                   color: voiceState.isListening
//                     ? "red"
//                     : "var(--theme-iconColor, #afafaf)",
//                   background: "var(--theme-iconBg, #ffffff0d)",
//                 }}
//               >
//                 {voiceState.isListening ? (
//                   <MicOff size={20} />
//                 ) : (
//                   <Mic size={20} />
//                 )}
//               </button>
//             )}
//             {showWebSearch && (
//               <button
//                 type="button"
//                 onClick={() => setUseWebSearch((prev) => !prev)}
//                 className="flex items-center gap-1 px-3 py-1 rounded-full border transition-colors duration-200"
//                 style={{
//                   color: "var(--theme-iconColor, #99ceff)",
//                   background: useWebSearch
//                     ? "var(--theme-iconBgActive, #3b4045)"
//                     : "var(--theme-iconBg, #ffffff0d)",
//                 }}
//               >
//                 <Globe size={16} />
//                 <span className="text-sm">Search</span>
//                 {useWebSearch && <X size={14} />}
//               </button>
//             )}
//           </div>

//           {/* Right side: Send Button */}
//           <button
//             onClick={handleSend}
//             disabled={disabled || (!input.trim() && !selectedFile)}
//             className="p-2 rounded-lg transition-colors"
//             title="Send message"
//             style={{
//               background:
//                 !disabled && (input.trim() || selectedFile)
//                   ? "var(--theme-iconBgActive, var(--theme-sendButtonBg, #7ab7ff))"
//                   : "var(--theme-iconBg, #ffffff0d)",
//               color:
//                 !disabled && (input.trim() || selectedFile)
//                   ? "#fff"
//                   : "var(--theme-iconColor, #afafaf)",
//               cursor:
//                 disabled || (!input.trim() && !selectedFile)
//                   ? "not-allowed"
//                   : "pointer",
//             }}
//           >
//             <Send size={20} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InputBox;

import React, { useState, useRef } from "react";
import { Send, Mic, MicOff, Paperclip, Globe, X, Sparkles } from "lucide-react";
import { useVoice } from "../hooks/useVoice";

interface InputBoxProps {
  onSendMessage: (message: string, file?: File, useWebSearch?: boolean) => void;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { voiceState, startListening, stopListening } = useVoice();

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
    setIsTyping(e.target.value.length > 0);
    adjustTextareaHeight();
  };

  // Handle voice transcript
  React.useEffect(() => {
    if (voiceState.transcript) {
      setInput(voiceState.transcript);
      setIsTyping(voiceState.transcript.length > 0);
      adjustTextareaHeight();
    }
  }, [voiceState.transcript]);

  // Handle send message
  const handleSend = () => {
    const message = input.trim();
    if (!message && !selectedFile) return;

    onSendMessage(message, selectedFile || undefined, useWebSearch);
    setInput("");
    setSelectedFile(null);
    setUseWebSearch(false);
    setIsTyping(false);

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

  const canSend = (input.trim() || selectedFile) && !disabled;

  return (
    <div
      className="px-4 py-4"
      style={{
        background: "transparent",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Main Input Container */}
        <div
          style={{
            background: "var(--theme-surface-bg)",
            borderRadius: "clamp(16px, 4vw, 24px)",
            border: "2px solid var(--theme-borderColor)",
            boxShadow: `0 8px 32px var(--theme-shadow)`,
            transition: "var(--theme-transition)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 12px 48px var(--theme-shadow)`;
            e.currentTarget.style.borderColor = "var(--theme-inputFocus)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `0 8px 32px var(--theme-shadow)`;
            e.currentTarget.style.borderColor = "var(--theme-borderColor)";
          }}
        >
          {/* File Preview */}
          {selectedFile && (
            <div
              className="m-4 mb-0"
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                background: "var(--theme-iconBg)",
                border: "1px solid var(--theme-borderColor)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Paperclip
                size={16}
                style={{ color: "var(--theme-iconColor)" }}
              />
              <span
                style={{
                  color: "var(--theme-text)",
                  fontSize: "14px",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedFile.name}
              </span>
              <button
                onClick={() => setSelectedFile(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--theme-error)",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  transition: "var(--theme-transition)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--theme-error)";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                  e.currentTarget.style.color = "var(--theme-error)";
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Input Area */}
          <div
            className="relative"
            style={{ padding: "8px 12px 0px 12px" }}
          >
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
                lineHeight: "1",
                fontFamily: "inherit",
                minHeight: "24px",
                maxHeight: "200px",
              }}
              className="placeholder-opacity-60"
            />

            {/* Voice listening indicator */}
            {voiceState.isListening && (
              <div
                className="absolute top-6 right-6 flex items-center gap-2"
                style={{
                  background: "var(--theme-error)",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    background: "#ffffff",
                    borderRadius: "50%",
                    animation: "pulse 1.5s infinite",
                  }}
                />
                Listening...
              </div>
            )}
          </div>

          {/* Controls Row */}
          <div
            className="flex items-center justify-between"
            style={{ padding: "0px 12px 8px 12px" }}
          >
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              {/* File Upload */}
              {showFileUpload && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: "clamp(2px, 1vw, 6px)",
                      borderRadius: "clamp(6px, 1.5vw, 10px)",
                      background: "var(--theme-iconBg)",
                      color: "var(--theme-iconColor)",
                      border: "none",
                      cursor: "pointer",
                      transition: "var(--theme-transition)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "var(--theme-iconHover)";
                      e.currentTarget.style.color = "#ffffff";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--theme-iconBg)";
                      e.currentTarget.style.color = "var(--theme-iconColor)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    title="Attach file"
                  >
                    <Paperclip size={16} />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                  />
                </>
              )}

              {/* Voice Input */}
              {showVoiceInput && voiceState.isSupported && (
                <button
                  onClick={handleVoiceToggle}
                  style={{
                    padding: "clamp(2px, 1vw, 6px)",
                    borderRadius: "clamp(6px, 1.5vw, 10px)",
                    background: voiceState.isListening
                      ? "var(--theme-error)"
                      : "var(--theme-iconBg)",
                    color: voiceState.isListening
                      ? "#ffffff"
                      : "var(--theme-iconColor)",
                    border: "none",
                    cursor: "pointer",
                    transition: "var(--theme-transition)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    if (!voiceState.isListening) {
                      e.currentTarget.style.background =
                        "var(--theme-iconHover)";
                      e.currentTarget.style.color = "#ffffff";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!voiceState.isListening) {
                      e.currentTarget.style.background = "var(--theme-iconBg)";
                      e.currentTarget.style.color = "var(--theme-iconColor)";
                      e.currentTarget.style.transform = "scale(1)";
                    }
                  }}
                  title={
                    voiceState.isListening
                      ? "Stop listening"
                      : "Start voice input"
                  }
                >
                  {voiceState.isListening ? (
                    <MicOff size={16} />
                  ) : (
                    <Mic size={16} />
                  )}
                </button>
              )}

              {/* Web Search Toggle */}
              {showWebSearch && (
                <button
                  onClick={() => setUseWebSearch((prev) => !prev)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "clamp(3px, 0.8vw, 6px)",
                    padding: "clamp(2px, 1vw, 6px)",
                    borderRadius: "clamp(10px, 2.5vw, 14px)",
                    background: useWebSearch
                      ? "var(--theme-sendButtonBg)"
                      : "var(--theme-iconBg)",
                    color: useWebSearch ? "#ffffff" : "var(--theme-iconColor)",
                    border: useWebSearch
                      ? "2px solid var(--theme-sendButtonBg)"
                      : "2px solid transparent",
                    cursor: "pointer",
                    transition: "var(--theme-transition)",
                    fontSize: "clamp(12px, 2.5vw, 14px)",
                    fontWeight: "500",
                  }}
                  onMouseEnter={(e) => {
                    if (!useWebSearch) {
                      e.currentTarget.style.background =
                        "var(--theme-iconHover)";
                      e.currentTarget.style.color = "#ffffff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!useWebSearch) {
                      e.currentTarget.style.background = "var(--theme-iconBg)";
                      e.currentTarget.style.color = "var(--theme-iconColor)";
                    }
                  }}
                >
                  <Globe size={14} />
                  <span className="hidden sm:inline">Search</span>
                  {useWebSearch && <Sparkles size={12} />}
                </button>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              style={{
                padding: "clamp(3px, 1.2vw, 7px)",
                borderRadius: "clamp(10px, 2.5vw, 14px)",
                background: canSend
                  ? `linear-gradient(135deg, var(--theme-sendButtonBg) 0%, var(--theme-sendButtonHover) 100%)`
                  : "var(--theme-iconBg)",
                color: canSend ? "#ffffff" : "var(--theme-text-tertiary)",
                border: "none",
                cursor: canSend ? "pointer" : "not-allowed",
                transition: "var(--theme-transition)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "clamp(4px, 1vw, 6px)",
                fontSize: "clamp(12px, 2.5vw, 14px)",
                fontWeight: "600",
                minWidth: canSend ? "50px" : "44px",
                boxShadow: canSend
                  ? `0 4px 16px rgba(59, 130, 246, 0.3)`
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (canSend) {
                  e.currentTarget.style.transform =
                    "translateY(-2px) scale(1.02)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(59, 130, 246, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (canSend) {
                  e.currentTarget.style.transform = "translateY(0px) scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(59, 130, 246, 0.3)";
                }
              }}
              title="Send message"
            >
              {canSend && isTyping && <Sparkles size={14} />}
              <Send size={16} />
              {canSend && <span className="hidden sm:inline">Send</span>}
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        textarea::placeholder {
          color: var(--theme-text-secondary);
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

export default InputBox;
