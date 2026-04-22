import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialFormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const mapAuthError = (error, t) => {
  const code = error?.code || "";

  switch (code) {
    case "auth/configuration-not-found":
      return t("auth.errors.firebaseNotConfigured");
    case "auth/email-already-in-use":
      return t("auth.errors.accountExists");
    case "auth/invalid-api-key":
      return t("auth.errors.invalidApiKey");
    case "auth/invalid-email":
      return t("auth.errors.invalidEmail");
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return t("auth.errors.incorrectCredentials");
    case "auth/operation-not-allowed":
      return t("auth.errors.signInNotEnabled");
    case "auth/popup-closed-by-user":
      return t("auth.errors.popupClosed");
    case "auth/popup-blocked":
      return t("auth.errors.popupBlocked");
    case "auth/unauthorized-domain":
      return t("auth.errors.unauthorizedDomain");
    case "auth/weak-password":
      return t("auth.errors.weakPassword");
    default:
      return error?.message ? `${error.message}${code ? ` (${code})` : ""}` : `${t("auth.errors.generic")}${code ? ` (${code})` : ""}`;
  }
};

const AuthForm = ({ onSuccess, compact = false }) => {
  const { t } = useLanguage();
  const { loading, login, signUp, signInWithGoogle, missingFirebaseMessage, isFirebaseConfigured } = useAuth();
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState(initialFormState);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setMessage({ type: "warning", text: missingFirebaseMessage });
    }
  }, [isFirebaseConfigured, missingFirebaseMessage]);

  const resetFeedback = () => {
    if (message.text) {
      setMessage((current) => (current.type === "warning" ? current : { type: "", text: "" }));
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const validate = () => {
    if (mode === "signup" && !formData.name.trim()) {
      return t("auth.errors.fullNameRequired");
    }

    if (!formData.email.trim() || !formData.password.trim()) {
      return t("auth.errors.fillRequired");
    }

    if (!emailPattern.test(formData.email.trim())) {
      return t("auth.errors.invalidEmail");
    }

    if (formData.password.length < 6) {
      return t("auth.errors.passwordShort");
    }

    if (mode === "signup" && formData.password !== formData.confirmPassword) {
      return t("auth.errors.passwordMismatch");
    }

    return "";
  };

  const finishSuccess = (text) => {
    setMessage({ type: "success", text });
    window.setTimeout(() => {
      onSuccess?.();
      setFormData(initialFormState);
      setSubmitting(false);
    }, 500);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetFeedback();

    const validationMessage = validate();
    if (validationMessage) {
      setMessage({ type: "error", text: validationMessage });
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "login") {
        await login({
          email: formData.email.trim(),
          password: formData.password,
        });
        finishSuccess(t("auth.successLogin"));
      } else {
        await signUp({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });
        finishSuccess(t("auth.successSignup"));
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: mapAuthError(error, t),
      });
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    resetFeedback();
    setSubmitting(true);

    try {
      await signInWithGoogle();
      finishSuccess(mode === "login" ? t("auth.successGoogleLogin") : t("auth.successGoogleSignup"));
    } catch (error) {
      setMessage({
        type: "error",
        text: mapAuthError(error, t),
      });
      setSubmitting(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setFormData(initialFormState);
    setMessage(isFirebaseConfigured ? { type: "", text: "" } : { type: "warning", text: missingFirebaseMessage });
  };

  if (loading) {
    return (
      <div className="auth-loading-card">
        {t("auth.loading")}
      </div>
    );
  }

  return (
    <div className={compact ? "auth-modal-layout auth-modal-layout-compact" : "auth-page-layout auth-page-layout-compact"}>
      <section className="auth-panel">
        <div className="auth-card auth-card-compact">
          <div className="auth-toggle">
            <button
              type="button"
              className={mode === "login" ? "auth-toggle-btn auth-toggle-btn-active" : "auth-toggle-btn"}
              onClick={() => switchMode("login")}
            >
              {t("auth.login")}
            </button>
            <button
              type="button"
              className={mode === "signup" ? "auth-toggle-btn auth-toggle-btn-active" : "auth-toggle-btn"}
              onClick={() => switchMode("signup")}
            >
              {t("auth.signUp")}
            </button>
          </div>

          <div className="auth-card-header">
            <p className="auth-card-kicker">{mode === "login" ? t("auth.memberLogin") : t("auth.createAccount")}</p>
            <h2>{mode === "login" ? t("auth.signInContinue") : t("auth.joinCommunity")}</h2>
          </div>

          {message.text ? (
            <div className={`auth-message auth-message-${message.type || "info"}`}>{message.text}</div>
          ) : null}

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" ? (
              <label className="auth-field">
                <span>{t("auth.name")}</span>
                <input
                  type="text"
                  name="name"
                  placeholder={t("auth.fullNamePlaceholder")}
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={resetFeedback}
                />
              </label>
            ) : null}

            <label className="auth-field">
              <span>{t("auth.email")}</span>
              <input
                type="email"
                name="email"
                placeholder={t("auth.emailPlaceholder")}
                value={formData.email}
                onChange={handleChange}
                onFocus={resetFeedback}
              />
            </label>

            <label className="auth-field">
              <span>{t("auth.password")}</span>
              <input
                type="password"
                name="password"
                placeholder={t("auth.passwordPlaceholder")}
                value={formData.password}
                onChange={handleChange}
                onFocus={resetFeedback}
              />
            </label>

            {mode === "signup" ? (
              <label className="auth-field">
                <span>{t("auth.confirmPassword")}</span>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder={t("auth.confirmPasswordPlaceholder")}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={resetFeedback}
                />
              </label>
            ) : null}

            <button type="submit" className="auth-submit-btn" disabled={submitting || !isFirebaseConfigured}>
              {submitting ? t("auth.pleaseWait") : mode === "login" ? t("auth.loginSecurely") : t("auth.createPremium")}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button type="button" className="auth-google-btn" onClick={handleGoogleAuth} disabled={submitting || !isFirebaseConfigured}>
            <FcGoogle size={24} />
            {mode === "login" ? t("auth.continueGoogle") : t("auth.signupGoogle")}
          </button>

          <p className="auth-footnote">
            {mode === "login" ? t("auth.newHere") : t("auth.alreadyHave")}{" "}
            <button type="button" className="auth-inline-btn" onClick={() => switchMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? t("auth.createAccountLink") : t("auth.loginInstead")}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
};

export default AuthForm;
