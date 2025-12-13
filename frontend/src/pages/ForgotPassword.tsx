import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, CheckCircle } from "lucide-react";
import Logo from "../asset/img/bharat5.png";
import { apiService } from "../services/api";

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  icon: Icon,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  icon?: any;
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
    </div>
  </div>
);

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiService.forgotPassword(email.trim());
      setSuccessMessage(true);
      setEmail("");
      // Auto-redirect after 3 seconds
      setTimeout(() => nav("/signin"), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to process request. Please try again.");
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
          <Mail
            size={56}
            style={{
              marginBottom: "24px",
              filter: "drop-shadow(0 8px 24px rgba(255,255,255,0.4))",
              position: "relative",
              zIndex: 2,
            }}
          />

          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: "800",
              marginBottom: "12px",
              textShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            Reset Your Password
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
            We'll send you a secure link
          </p>
          <p
            style={{
              fontSize: "clamp(14px, 2vw, 16px)",
              opacity: 0.85,
              lineHeight: 1.5,
              textShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}
          >
            to reset your password easily
          </p>
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
                overflow: "hidden",
                marginBottom: "clamp(20px, 3vw, 24px)",
              }}
            >
              <img
                src={Logo}
                alt="Logo"
                style={{
                  height: "clamp(50px, 8vw, 70px)",
                  objectFit: "contain",
                  padding: "8px",
                }}
              />
            </div>

            <h1
              style={{
                fontSize: "clamp(26px, 4vw, 32px)",
                fontWeight: "800",
                marginBottom: "clamp(8px, 2vw, 12px)",
                color: "var(--theme-text)",
                background:
                  "linear-gradient(135deg, var(--theme-text) 0%, var(--theme-text-secondary) 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Forgot Password?
            </h1>

            <p
              style={{
                fontSize: "clamp(13px, 2.5vw, 14px)",
                color: "var(--theme-text-secondary)",
                marginBottom: "clamp(24px, 4vw, 32px)",
              }}
            >
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>

          {!successMessage ? (
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

              {/* Error Message */}
              {error && (
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
                  ⚠️ {error}
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
                        borderTop: "2px solid #ffffff",
                        borderRight: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    Send Reset Link
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
                  Remember your password?{" "}
                  <Link
                    to="/signin"
                    style={{
                      color: "var(--theme-sendButtonBg)",
                      textDecoration: "none",
                      fontWeight: "600",
                      transition: "var(--theme-transition)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.8";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: "center", paddingTop: "24px" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, var(--theme-sendButtonBg) 0%, var(--theme-sendButtonHover) 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto clamp(20px, 4vw, 32px)",
                  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)",
                }}
              >
                <CheckCircle size={48} color="white" />
              </div>

              <h2
                style={{
                  fontSize: "clamp(24px, 4vw, 32px)",
                  fontWeight: "800",
                  marginBottom: "clamp(8px, 2vw, 12px)",
                  color: "var(--theme-text)",
                }}
              >
                Check Your Email
              </h2>

              <p
                style={{
                  fontSize: "clamp(13px, 2.5vw, 14px)",
                  color: "var(--theme-text-secondary)",
                  marginBottom: "clamp(20px, 3vw, 24px)",
                  lineHeight: 1.6,
                }}
              >
                If an account exists with this email address, we've sent a
                password reset link. Please check your inbox and click the link
                to reset your password.
              </p>

              <p
                style={{
                  fontSize: "clamp(12px, 2vw, 13px)",
                  color: "var(--theme-text-tertiary)",
                  marginBottom: "clamp(20px, 3vw, 24px)",
                }}
              >
                Redirecting to sign in...
              </p>

              <Link
                to="/signin"
                style={{
                  display: "inline-block",
                  padding: "clamp(10px, 2vw, 12px) clamp(24px, 4vw, 32px)",
                  borderRadius: "12px",
                  background: `linear-gradient(135deg, var(--theme-sendButtonBg) 0%, var(--theme-sendButtonHover) 100%)`,
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "clamp(13px, 2.5vw, 14px)",
                  transition: "var(--theme-transition)",
                  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 32px rgba(59, 130, 246, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(59, 130, 246, 0.3)";
                }}
              >
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
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
