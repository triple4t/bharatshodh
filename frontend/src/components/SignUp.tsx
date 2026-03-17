import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  X,
  User,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Sparkles,
  Languages,
  Globe,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
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
            right: "1px",
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

export default function SignUp() {
  const nav = useNavigate();
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { t } = useLanguage();
  const [registeredEmail, setRegisteredEmail] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (pw !== pw2) {
      setErr("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email.trim(), pw, name.trim() || undefined);
      setRegistered(true);
      setRegisteredEmail(email.trim());
    } catch (e: any) {
      setErr(e?.message || "Sign up failed");
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
          <div className="shape shape-5"></div>
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
          {/* 3D Chat Icon */}
          <div
            className="chat-icon-3d"
            style={{
              position: "relative",
              display: "inline-block",
              marginBottom: "24px",
            }}
          >
            <MessageSquare
              size={56}
              style={{
                filter: "drop-shadow(0 8px 28px rgba(255,255,255,0.5))",
                position: "relative",
                zIndex: 2,
              }}
            />
            <Sparkles
              size={28}
              style={{
                position: "absolute",
                top: "-4px",
                right: "-6px",
                filter: "drop-shadow(0 4px 16px rgba(255,255,255,0.4))",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <Globe
              size={24}
              style={{
                position: "absolute",
                bottom: "0px",
                left: "-8px",
                filter: "drop-shadow(0 4px 16px rgba(255,255,255,0.3))",
                animation: "float 4s ease-in-out infinite",
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
            {t("auth.join")}
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
            India's multilingual AI chatbot assistant
          </p>
          <p
            style={{
              fontSize: "clamp(14px, 2vw, 16px)",
              opacity: 0.85,
              lineHeight: 1.5,
              marginBottom: "32px",
              textShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}
          >
            Chat in your language, get instant AI-powered responses
          </p>

          {/* Feature List */}
          <div
            style={{ textAlign: "left", maxWidth: "420px", margin: "0 auto" }}
          >
            {[
              { icon: Languages, text: "22+ Indian languages supported" },
              { icon: MessageSquare, text: "ChatGPT-like AI conversations" },
              { icon: Sparkles, text: "Smart context understanding" },
              { icon: CheckCircle, text: "Personalized responses" },
            ].map((feature, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  marginBottom: "14px",
                  padding: "14px 18px",
                  background: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <feature.icon size={22} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "15px", fontWeight: "500" }}>
                  {feature.text}
                </span>
              </div>
            ))}
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
            paddingTop: "20px",
            paddingBottom: "20px",
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
              {t("auth.start")}
            </h1>
            <p
              style={{
                margin: "0",
                fontSize: "clamp(14px, 3vw, 16px)",
                color: "var(--theme-text-secondary)",
                fontWeight: "500",
              }}
            >
              Your AI assistant in every Indian language 🇮🇳
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
            {registered ? (
              // Success Message - Pending Approval
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(16px, 4vw, 20px)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "80px",
                    height: "80px",
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    borderRadius: "50%",
                    margin: "0 auto",
                    boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  <CheckCircle size={48} color="white" />
                </div>

                <div>
                  <h2
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "clamp(24px, 6vw, 32px)",
                      fontWeight: "800",
                      background:
                        "linear-gradient(135deg, var(--theme-text) 0%, #10b981 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Registration Successful! 🎉
                  </h2>
                  <p
                    style={{
                      margin: "0",
                      fontSize: "clamp(14px, 3vw, 16px)",
                      color: "var(--theme-text-secondary)",
                      fontWeight: "500",
                    }}
                  >
                    We've received your registration
                  </p>
                </div>

                <div
                  style={{
                    background: "color-mix(in srgb, #10b981 10%, transparent)",
                    border: "1px solid #10b981",
                    borderRadius: "12px",
                    padding: "20px 16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      marginBottom: "16px",
                    }}
                  >
                    <CheckCircle
                      size={20}
                      style={{
                        color: "#10b981",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    />
                    <div style={{ textAlign: "left" }}>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "var(--theme-text)",
                        }}
                      >
                        Account Created
                      </p>
                      <p
                        style={{
                          margin: "0",
                          fontSize: "13px",
                          color: "var(--theme-text-secondary)",
                        }}
                      >
                        Your email <strong>{registeredEmail}</strong> has been
                        registered
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background:
                      "color-mix(in srgb, var(--theme-iconColor) 10%, transparent)",
                    border: "1px solid var(--theme-iconColor)",
                    borderRadius: "12px",
                    padding: "20px 16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "var(--theme-iconColor)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "bold",
                        flexShrink: 0,
                      }}
                    >
                      ⏳
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <p
                        style={{
                          margin: "0 0 6px 0",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "var(--theme-text)",
                        }}
                      >
                        Awaiting Admin Approval
                      </p>
                      <p
                        style={{
                          margin: "0 0 8px 0",
                          fontSize: "13px",
                          color: "var(--theme-text-secondary)",
                          lineHeight: "1.5",
                        }}
                      >
                        Your account is now pending review by our admin team.
                        You'll receive an email confirmation once your account
                        is approved.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background:
                      "color-mix(in srgb, var(--theme-sendButtonBg) 10%, transparent)",
                    border: "1px solid var(--theme-sendButtonBg)",
                    borderRadius: "12px",
                    padding: "16px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--theme-text)",
                    }}
                  >
                    ✉️ Check Your Email
                  </p>
                  <p
                    style={{
                      margin: "0",
                      fontSize: "12px",
                      color: "var(--theme-text-secondary)",
                      lineHeight: "1.5",
                    }}
                  >
                    We'll send you an email at{" "}
                    <strong>{registeredEmail}</strong> with next steps once your
                    account is approved.
                  </p>
                </div>

                <div style={{ paddingTop: "8px" }}>
                  <button
                    onClick={() => nav("/signin")}
                    style={{
                      width: "100%",
                      padding: "clamp(12px, 3vw, 16px)",
                      borderRadius: "12px",
                      minHeight: "48px",
                      background:
                        "linear-gradient(135deg, var(--theme-sendButtonBg) 0%, var(--theme-sendButtonHover) 100%)",
                      border: "none",
                      color: "#ffffff",
                      fontSize: "clamp(14px, 3vw, 16px)",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "var(--theme-transition)",
                      boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 32px rgba(59, 130, 246, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(59, 130, 246, 0.3)";
                    }}
                  >
                    Return to Login
                  </button>
                </div>

                <p
                  style={{
                    margin: "clamp(12px, 3vw, 16px) 0 0 0",
                    fontSize: "clamp(12px, 2.5vw, 14px)",
                    color: "var(--theme-text-secondary)",
                    lineHeight: "1.5",
                  }}
                >
                  Once approved, you can log in with your email and password.
                  You can also refresh this page.
                </p>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(16px, 4vw, 20px)",
                }}
              >
                <InputField
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  icon={User}
                />

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
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Create password"
                  required
                  icon={Lock}
                  showPassword={showPw}
                  onTogglePassword={() => setShowPw(!showPw)}
                />

                <InputField
                  label="Confirm Password"
                  type={showPw ? "text" : "password"}
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  placeholder="Confirm password"
                  required
                  icon={Lock}
                  showPassword={showPw}
                  onTogglePassword={() => setShowPw(!showPw)}
                />

                {/* Error Message */}
                {err && (
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
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={18} />
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
                    Already have an account?{" "}
                    <Link
                      to="/signin"
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
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            )}
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
          33% { transform: translateY(-30px) rotate(120deg); }
          66% { transform: translateY(-15px) rotate(240deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes slideIn {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
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
          opacity: 0.25;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1));
          animation: float 25s infinite ease-in-out;
        }

        .shape-1 {
          width: 350px;
          height: 350px;
          top: 5%;
          left: 5%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 200px;
          height: 200px;
          top: 50%;
          right: 15%;
          animation-delay: 5s;
        }

        .shape-3 {
          width: 180px;
          height: 180px;
          bottom: 15%;
          left: 25%;
          animation-delay: 10s;
        }

        .shape-4 {
          width: 280px;
          height: 280px;
          top: 25%;
          right: 25%;
          animation-delay: 15s;
        }

        .shape-5 {
          width: 150px;
          height: 150px;
          bottom: 30%;
          right: 10%;
          animation-delay: 20s;
          animation: pulse 18s infinite ease-in-out;
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
