import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import Logo from "../asset/img/bharat5.png";
import { apiService } from "../services/api";
import ThemeCustomizer from "../components/ThemeCustomizer";

interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon?: React.ComponentType<{ size: number; style?: React.CSSProperties }>;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  required?: boolean;
}

function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  showPassword,
  onTogglePassword,
  required = false,
}: InputFieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label
        style={{
          fontSize: "clamp(13px, 2.5vw, 14px)",
          fontWeight: "600",
          color: "var(--theme-text)",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--theme-error, #ef4444)" }}>*</span>
        )}
      </label>
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        {Icon && (
          <Icon
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              color: "var(--theme-text-secondary)",
              pointerEvents: "none",
            }}
          />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={{
            width: "100%",
            padding: "10px 12px 10px 40px",
            border: "1px solid var(--theme-borderColor)",
            borderRadius: "10px",
            background: "var(--theme-inputBg)",
            color: "var(--theme-text)",
            fontSize: "clamp(13px, 2.5vw, 14px)",
            transition: "var(--theme-transition)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            outlineColor: "var(--theme-sendButtonBg)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--theme-sendButtonBg)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(59, 130, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--theme-borderColor)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
          }}
        />
        {onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            style={{
              position: "absolute",
              right: "12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--theme-text-secondary)",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ResetPassword() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (!tokenParam || !emailParam) {
      setInvalidToken(true);
      return;
    }

    setToken(tokenParam);
    setEmail(emailParam);
  }, [searchParams]);

  const validatePasswords = (): string | null => {
    if (!newPassword) return "New password is required";
    if (newPassword.length < 8) return "Password must be at least 8 characters";
    if (newPassword !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validatePasswords();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!token) {
      setError("Invalid reset link");
      return;
    }

    setSubmitting(true);
    try {
      await apiService.resetPassword(token, newPassword);
      setSuccessMessage(true);
      setTimeout(() => nav("/signin"), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to reset password. Please try again.");
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
        background: "var(--theme-background)",
      }}
    >
      {/* Left Side - Gradient Background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, var(--theme-sendButtonBg) 0%, var(--theme-sendButtonHover) 100%)`,
            top: "-200px",
            left: "-200px",
            opacity: 0.15,
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, var(--theme-sendButtonBg) 0%, var(--theme-sendButtonHover) 100%)`,
            bottom: "-150px",
            right: "-150px",
            opacity: 0.1,
            filter: "blur(50px)",
          }}
        />
      </div>

      {/* Content Container */}
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(20px, 5vw, 60px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Theme Customizer Button */}
        <button
          onClick={() => setShowThemeModal(true)}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            border: "2px solid var(--theme-borderColor)",
            background: "var(--theme-surface-bg)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            transition: "var(--theme-transition)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.borderColor = "var(--theme-sendButtonBg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.borderColor = "var(--theme-borderColor)";
          }}
        >
          🎨
        </button>

        {/* Back Link */}
        <Link
          to="/signin"
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            color: "var(--theme-text-secondary)",
            textDecoration: "none",
            fontSize: "clamp(13px, 2.5vw, 14px)",
            fontWeight: "600",
            transition: "var(--theme-transition)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--theme-sendButtonBg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--theme-text-secondary)";
          }}
        >
          ← Back to Sign In
        </Link>

        {/* Main Card */}
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            padding: "clamp(30px, 5vw, 50px)",
            borderRadius: "16px",
            background: "var(--theme-surface-bg)",
            border: "1px solid var(--theme-borderColor)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          {invalidToken ? (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, var(--theme-sendButtonBg) 0%, var(--theme-sendButtonHover) 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <Lock size={40} style={{ color: "white" }} />
              </div>
              <h2
                style={{
                  fontSize: "clamp(22px, 4vw, 26px)",
                  fontWeight: "700",
                  marginBottom: "12px",
                  color: "var(--theme-text)",
                }}
              >
                Invalid Reset Link
              </h2>
              <p
                style={{
                  color: "var(--theme-text-secondary)",
                  fontSize: "clamp(13px, 2.5vw, 14px)",
                  marginBottom: "24px",
                  lineHeight: "1.6",
                }}
              >
                This password reset link is invalid or has expired. Please
                request a new one.
              </p>
              <Link
                to="/forgot-password"
                style={{
                  display: "inline-block",
                  padding: "10px 24px",
                  borderRadius: "12px",
                  background: `linear-gradient(135deg, var(--theme-sendButtonBg) 0%, var(--theme-sendButtonHover) 100%)`,
                  color: "white",
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
                Request New Link
              </Link>
            </div>
          ) : !successMessage ? (
            <>
              {/* Logo */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "clamp(20px, 5vw, 30px)",
                }}
              >
                <img
                  src={Logo}
                  alt="Logo"
                  style={{
                    height: "clamp(40px, 8vw, 60px)",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* Header */}
              <h1
                style={{
                  fontSize: "clamp(24px, 4vw, 28px)",
                  fontWeight: "700",
                  marginBottom: "8px",
                  color: "var(--theme-text)",
                  textAlign: "center",
                }}
              >
                Reset Your Password
              </h1>
              <p
                style={{
                  textAlign: "center",
                  color: "var(--theme-text-secondary)",
                  fontSize: "clamp(13px, 2.5vw, 14px)",
                  marginBottom: "clamp(24px, 5vw, 32px)",
                }}
              >
                {email
                  ? `Resetting password for ${email}`
                  : "Enter your new password below"}
              </p>

              {/* Form */}
              <form
                onSubmit={onSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(16px, 3vw, 20px)",
                }}
              >
                <InputField
                  label="New Password"
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  icon={Lock}
                  showPassword={showNewPw}
                  onTogglePassword={() => setShowNewPw(!showNewPw)}
                  required
                />

                <InputField
                  label="Confirm Password"
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  icon={Lock}
                  showPassword={showConfirmPw}
                  onTogglePassword={() => setShowConfirmPw(!showConfirmPw)}
                  required
                />

                {/* Password Requirements */}
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "rgba(59, 130, 246, 0.05)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    fontSize: "clamp(12px, 2.5vw, 13px)",
                    color: "var(--theme-text-secondary)",
                  }}
                >
                  <div
                    style={{
                      marginBottom: "6px",
                      fontWeight: "600",
                      color: "var(--theme-text)",
                    }}
                  >
                    Password Requirements:
                  </div>
                  <ul style={{ margin: "0", paddingLeft: "20px" }}>
                    <li style={{ marginBottom: "2px" }}>
                      <span
                        style={{
                          color:
                            newPassword.length >= 8
                              ? "var(--theme-sendButtonBg)"
                              : "var(--theme-text-secondary)",
                        }}
                      >
                        {newPassword.length >= 8 ? "✓" : "○"}
                      </span>{" "}
                      At least 8 characters
                    </li>
                    <li>
                      <span
                        style={{
                          color:
                            newPassword === confirmPassword && newPassword
                              ? "var(--theme-sendButtonBg)"
                              : "var(--theme-text-secondary)",
                        }}
                      >
                        {newPassword === confirmPassword && newPassword
                          ? "✓"
                          : "○"}
                      </span>{" "}
                      Passwords match
                    </li>
                  </ul>
                </div>

                {error && (
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "rgba(239, 68, 68, 0.05)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      color: "var(--theme-error, #ef4444)",
                      fontSize: "clamp(12px, 2.5vw, 13px)",
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !newPassword || !confirmPassword}
                  style={{
                    padding: "clamp(11px, 2.5vw, 13px) clamp(20px, 3vw, 24px)",
                    borderRadius: "12px",
                    border: "none",
                    background:
                      submitting || !newPassword || !confirmPassword
                        ? "rgba(59, 130, 246, 0.5)"
                        : `linear-gradient(135deg, var(--theme-sendButtonBg) 0%, var(--theme-sendButtonHover) 100%)`,
                    color: "white",
                    fontSize: "clamp(14px, 2.8vw, 15px)",
                    fontWeight: "600",
                    cursor:
                      submitting || !newPassword || !confirmPassword
                        ? "not-allowed"
                        : "pointer",
                    transition: "var(--theme-transition)",
                    minHeight: "44px",
                    boxShadow:
                      submitting || !newPassword || !confirmPassword
                        ? "none"
                        : "0 8px 24px rgba(59, 130, 246, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting && newPassword && confirmPassword) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 32px rgba(59, 130, 246, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting && newPassword && confirmPassword) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(59, 130, 246, 0.3)";
                    }
                  }}
                >
                  {submitting ? "Resetting Password..." : "Reset Password"}
                </button>
              </form>

              {/* Sign In Link */}
              <p
                style={{
                  textAlign: "center",
                  marginTop: "clamp(20px, 3vw, 24px)",
                  color: "var(--theme-text-secondary)",
                  fontSize: "clamp(13px, 2.5vw, 14px)",
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
                    e.currentTarget.style.textDecoration = "underline";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = "none";
                  }}
                >
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, var(--theme-sendButtonBg) 0%, var(--theme-sendButtonHover) 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <CheckCircle size={40} style={{ color: "white" }} />
              </div>
              <h2
                style={{
                  fontSize: "clamp(22px, 4vw, 26px)",
                  fontWeight: "700",
                  marginBottom: "12px",
                  color: "var(--theme-text)",
                }}
              >
                Password Reset Successful
              </h2>
              <p
                style={{
                  color: "var(--theme-text-secondary)",
                  fontSize: "clamp(13px, 2.5vw, 14px)",
                  marginBottom: "24px",
                  lineHeight: "1.6",
                }}
              >
                Your password has been successfully reset. You can now sign in
                with your new password.
              </p>
              <p
                style={{
                  color: "var(--theme-text-tertiary, rgba(107, 114, 128, 0.8))",
                  fontSize: "clamp(12px, 2.5vw, 13px)",
                }}
              >
                Redirecting to sign in...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Theme Modal */}
      {showThemeModal && (
        <ThemeCustomizer onClose={() => setShowThemeModal(false)} />
      )}
    </div>
  );
}
