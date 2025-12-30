import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  X,
  Mail,
  Lock,
  LogIn,
  MessageCircle,
  Languages,
  Bot,
  Clock,
  AlertCircle,
} from "lucide-react";
import Logo from "../asset/img/bharat5.png";
import ThemeCustomizer from "./ThemeCustomizer";

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  icon: Icon,
  showPassword,
  onTogglePassword,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  icon?: any;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}) => (
  <div style={{ position: "relative" }}>
    <label
      style={{
        display: "block",
        fontSize: "clamp(12px, 2.5vw, 14px)",
        fontWeight: "600",
        marginBottom: "clamp(6px, 1.5vw, 8px)",
        color: "var(--theme-text)",
      }}
    >
      {label}
    </label>
    <div style={{ position: "relative" }}>
      {Icon && (
        <Icon
          size={18}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--theme-text-tertiary)",
            zIndex: 1,
          }}
        />
      )}
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="modern-input"
        style={{
          width: "100%",
          padding: Icon
            ? "clamp(10px, 2.5vw, 12px) clamp(36px, 8vw, 40px)"
            : "clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)",
          borderRadius: "12px",
          border: "2px solid var(--theme-borderColor)",
          background: "var(--theme-inputBg)",
          color: "var(--theme-text)",
          fontSize: "clamp(13px, 2.8vw, 14px)",
          transition: "var(--theme-transition)",
          outline: "none",
          boxShadow: `0 1px 3px var(--theme-shadow)`,
          minHeight: "44px",
        }}
      />
      {onTogglePassword && (
        <button
          type="button"
          onClick={onTogglePassword}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: "var(--theme-iconColor)",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "6px",
            transition: "var(--theme-transition)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--theme-iconHover)";
            e.currentTarget.style.background = "var(--theme-iconBg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--theme-iconColor)";
            e.currentTarget.style.background = "none";
          }}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  </div>
);

export default function SignIn() {
  const nav = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      nav("/");
    } catch (e: any) {
      setErr(e?.message || "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left Side - Visual Section */}
      <div
        style={{
          flex: "0 0 50%",
          background: `linear-gradient(135deg, 
            var(--theme-auth-gradient-start) 0%, 
            var(--theme-auth-gradient-mid) 50%, 
            var(--theme-auth-gradient-end) 100%)`,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px 40px",
          color: "white",
        }}
        className="auth-visual-side"
      >
        {/* Animated Background Shapes */}
        <div className="bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            maxWidth: "500px",
          }}
        >
          {/* 3D Chat Bot Icon */}
          <div className="chat-bot-3d" style={{ marginBottom: "24px" }}>
            <Bot
              size={56}
              style={{
                filter: "drop-shadow(0 8px 24px rgba(255,255,255,0.4))",
                position: "relative",
                zIndex: 2,
              }}
            />
            <MessageCircle
              size={32}
              style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                filter: "drop-shadow(0 4px 12px rgba(255,255,255,0.3))",
                animation: "float 3s ease-in-out infinite",
              }}
            />
          </div>

          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: "800",
              marginBottom: "12px",
              textShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            Welcome to BharatShodh
          </h1>
          <p
            style={{
              fontSize: "clamp(16px, 2.5vw, 20px)",
              opacity: 0.95,
              lineHeight: 1.6,
              marginBottom: "8px",
              textShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}
          >
            Your AI-powered multilingual chatbot assistant
          </p>
          <p
            style={{
              fontSize: "clamp(14px, 2vw, 16px)",
              opacity: 0.85,
              lineHeight: 1.5,
              textShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}
          >
            Supporting all Indian languages + English
          </p>

          {/* Language Indicators */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "32px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Languages size={20} style={{ opacity: 0.9 }} />
            {["हिंदी", "తెలుగు", "தமிழ்", "English", "ગુજરાતી"].map((lang) => (
              <div
                key={lang}
                style={{
                  padding: "6px 16px",
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "600",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                {lang}
              </div>
            ))}
            <div
              style={{
                padding: "6px 16px",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "600",
                border: "1px solid rgba(255,255,255,0.25)",
                opacity: 0.8,
              }}
            >
              +17 more
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div
        style={{
          flex: "0 0 50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          background: "var(--theme-secondary-bg)",
          position: "relative",
          overflowY: "auto",
        }}
        className="auth-form-side"
      >
        <div
          style={{
            maxWidth: "440px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "clamp(20px, 5vw, 32px)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-block",
                padding: "0px",
                borderRadius: "clamp(12px, 3vw, 20px)",
                background: "var(--theme-surface-bg)",
                border: "1px solid var(--theme-borderColor)",
                boxShadow: `0 8px 24px var(--theme-shadow)`,
                marginBottom: "clamp(16px, 4vw, 24px)",
              }}
            >
              <img
                src={Logo}
                alt="Logo"
                style={{
                  height: "clamp(36px, 8vw, 48px)",
                  width: "auto",
                  display: "block",
                }}
              />
            </div>
            <h1
              style={{
                margin: "0 0 clamp(4px, 1vw, 8px) 0",
                fontSize: "clamp(24px, 6vw, 32px)",
                fontWeight: "800",
                background:
                  "linear-gradient(135deg, var(--theme-text) 0%, var(--theme-iconColor) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Sign In
            </h1>
            <p
              style={{
                margin: "0",
                fontSize: "clamp(14px, 3vw, 16px)",
                color: "var(--theme-text-secondary)",
                fontWeight: "500",
              }}
            >
              Enter your credentials to continue
            </p>
          </div>

          {/* Form Card */}
          <div
            style={{
              background: "var(--theme-surface-bg)",
              borderRadius: "clamp(16px, 4vw, 24px)",
              padding: "clamp(20px, 5vw, 32px)",
              border: "1px solid var(--theme-borderColor)",
              boxShadow: `0 20px 60px var(--theme-shadow)`,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            <form
              onSubmit={onSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "clamp(16px, 4vw, 24px)",
              }}
            >
              <InputField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                icon={Mail}
              />

              <InputField
                label="Password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                icon={Lock}
                showPassword={showPw}
                onTogglePassword={() => setShowPw(!showPw)}
              />

              {/* Forgot Password Link */}
              <div style={{ textAlign: "right" }}>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: "clamp(12px, 2.5vw, 13px)",
                    color: "var(--theme-text-secondary)",
                    textDecoration: "none",
                    fontWeight: "500",
                    transition: "var(--theme-transition)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--theme-iconColor)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--theme-text-secondary)";
                  }}
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Error Message */}
              {err && (
                <div>
                  {err.includes("pending approval") ? (
                    // Pending Approval Message
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        background:
                          "color-mix(in srgb, var(--theme-iconColor) 10%, transparent)",
                        border: "1px solid var(--theme-iconColor)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "flex-start",
                        }}
                      >
                        <Clock
                          size={20}
                          style={{
                            color: "var(--theme-iconColor)",
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        />
                        <div style={{ textAlign: "left" }}>
                          <p
                            style={{
                              margin: "0 0 6px 0",
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "var(--theme-text)",
                            }}
                          >
                            Account Pending Approval ⏳
                          </p>
                          <p
                            style={{
                              margin: "0 0 8px 0",
                              fontSize: "13px",
                              color: "var(--theme-text-secondary)",
                              lineHeight: "1.5",
                            }}
                          >
                            Your account is in the waiting queue. You’ll be
                            notified by email when access becomes available.
                          </p>
                          <p
                            style={{
                              margin: "0",
                              fontSize: "12px",
                              color: "var(--theme-text-secondary)",
                            }}
                          >
                            Check your email for updates or contact support if
                            you have questions.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : err.includes("rejected") ? (
                    // Rejected Message
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        background:
                          "color-mix(in srgb, var(--theme-error) 10%, transparent)",
                        border: "1px solid var(--theme-error)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "flex-start",
                        }}
                      >
                        <AlertCircle
                          size={20}
                          style={{
                            color: "var(--theme-error)",
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        />
                        <div style={{ textAlign: "left" }}>
                          <p
                            style={{
                              margin: "0 0 6px 0",
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "var(--theme-text)",
                            }}
                          >
                            Account Rejected ❌
                          </p>
                          <p
                            style={{
                              margin: "0",
                              fontSize: "13px",
                              color: "var(--theme-text-secondary)",
                              lineHeight: "1.5",
                            }}
                          >
                            Your account has been rejected. Please contact
                            support for more information or try registering with
                            a different account.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Generic Error Message
                    <div
                      style={{
                        padding: "12px 16px",
                        borderRadius: "12px",
                        background: `color-mix(in srgb, var(--theme-error) 10%, transparent)`,
                        border: "1px solid var(--theme-error)",
                        color: "var(--theme-error)",
                        fontSize: "14px",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      ⚠️ {err}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "clamp(12px, 3vw, 16px)",
                  borderRadius: "12px",
                  minHeight: "48px",
                  background: submitting
                    ? "transparent"
                    : `linear-gradient(135deg, var(--theme-sendButtonBg) 0%, var(--theme-sendButtonHover) 100%)`,
                  border: submitting
                    ? "2px solid var(--theme-sendButtonBg)"
                    : "none",
                  color: submitting ? "var(--theme-text)" : "#ffffff",
                  fontSize: "clamp(14px, 3vw, 16px)",
                  fontWeight: "600",
                  cursor: submitting ? "not-allowed" : "pointer",
                  transition: "var(--theme-transition)",
                  boxShadow: submitting
                    ? "none"
                    : `0 8px 24px rgba(59, 130, 246, 0.3)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  opacity: submitting ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 32px rgba(59, 130, 246, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.transform = "translateY(0px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(59, 130, 246, 0.3)";
                  }
                }}
              >
                {submitting ? (
                  <>
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        border: "2px solid var(--theme-text-tertiary)",
                        borderTop: "2px solid var(--theme-text)",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>

              {/* Footer */}
              <div
                style={{
                  textAlign: "center",
                  paddingTop: "clamp(4px, 1vw, 8px)",
                }}
              >
                <p
                  style={{
                    margin: "0",
                    fontSize: "clamp(12px, 2.5vw, 14px)",
                    color: "var(--theme-text-secondary)",
                  }}
                >
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    style={{
                      color: "var(--theme-iconColor)",
                      textDecoration: "none",
                      fontWeight: "600",
                      transition: "var(--theme-transition)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--theme-iconHover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--theme-iconColor)";
                    }}
                  >
                    Create one here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Theme Modal */}
      {showThemeModal && (
        <div
          style={{
            position: "fixed",
            inset: "0",
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--theme-overlay)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={() => setShowThemeModal(false)}
        >
          <div
            style={{
              position: "relative",
              margin: "16px",
              borderRadius: "20px",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                zIndex: 10,
                background: "var(--theme-surface-bg)",
                border: "1px solid var(--theme-borderColor)",
                borderRadius: "8px",
                padding: "8px",
                color: "var(--theme-text)",
                cursor: "pointer",
                transition: "var(--theme-transition)",
              }}
              onClick={() => setShowThemeModal(false)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--theme-iconBg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--theme-surface-bg)";
              }}
            >
              <X size={16} />
            </button>
            <ThemeCustomizer onClose={() => setShowThemeModal(false)} />
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(-10px) rotate(240deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        .modern-input:focus {
          border: 2px solid var(--theme-inputFocus) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px var(--theme-shadow) !important;
        }
        
        .modern-input:not(:focus) {
          border: 2px solid var(--theme-borderColor) !important;
          box-shadow: 0 1px 3px var(--theme-shadow) !important;
        }

        .bg-shapes {
          position: absolute;
          inset: 0;
          overflow: hidden;
          opacity: 0.3;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1));
          animation: float 20s infinite ease-in-out;
        }

        .shape-1 {
          width: 300px;
          height: 300px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 200px;
          height: 200px;
          top: 60%;
          right: 10%;
          animation-delay: 5s;
        }

        .shape-3 {
          width: 150px;
          height: 150px;
          bottom: 20%;
          left: 30%;
          animation-delay: 10s;
        }

        .shape-4 {
          width: 250px;
          height: 250px;
          top: 30%;
          right: 20%;
          animation-delay: 15s;
          animation: pulse 15s infinite ease-in-out;
        }

        /* Mobile Responsive */
        @media (max-width: 968px) {
          .auth-visual-side {
            display: none !important;
          }
          
          .auth-form-side {
            flex: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
