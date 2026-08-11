"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { isValidEmail } from "@/app/util/validators";
import styles from "./login.module.css";
import DynamicData from "../util/Dynamicdata";
import { ENV } from "@/config/env";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        setFormError("Access denied: You are logged in with a non-admin account.");
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setFormError("Please enter your admin email and password.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setFormError("Please enter a valid email address (e.g. admin@krackdeal.com).");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(cleanEmail, password);
      if (result.success) {
        const role = result.user?.role;
        if (role === "admin") {
          router.push("/admin");
          router.refresh();
        } else {
          setFormError("Access denied: Administrator account required.");
        }
      } else {
        if (result.isVerified === false) {
          router.push(`/verify?email=${encodeURIComponent(result.email || cleanEmail)}`);
        } else {
          setFormError(result.message || "Invalid email or password");
        }
      }
    } catch (err) {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      {/* Back Link */}
      <a href={`${ENV.STORE_URL}/`} className={styles.link} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", marginBottom: "20px", width: "fit-content" }}>
        <ArrowLeft size={14} />
        <span>Back to Customer Site</span>
      </a>

      {/* Brand Header */}
      <div className={styles.header}>
        <div className={styles.logoWrapper} onClick={() => router.push("/admin")}>
          <div className={styles.logoIcon}>D</div>
          <span className={styles.logoText}>
            {DynamicData.Logoheading}<span className={styles.logoDot}>.</span>
          </span>
        </div>
        <h2 className={styles.title}>Admin Panel</h2>
        <p className={styles.subtitle}>Sign in with your administrator credentials</p>
      </div>

      {/* Error Alert */}
      {formError && (
        <div className={styles.errorAlert} style={{ marginBottom: "20px" }}>
          <AlertCircle size={16} />
          <span>{formError}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <Mail size={14} />
            <span>Email Address</span>
          </label>
          <div className={styles.inputWrapper}>
            <Mail size={16} className={styles.inputIcon} />
            <input
              type="email"
              placeholder="admin@krackdeal.com"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <Lock size={14} />
            <span>Password</span>
          </label>
          <div className={styles.inputWrapper}>
            <Lock size={16} className={styles.inputIcon} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "16px",
                color: "var(--text-muted)",
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.2s ease"
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <a href={`${ENV.STORE_URL}/forgot-password`} className={styles.link} style={{ alignSelf: "flex-end", fontSize: "12px", textDecoration: "none", fontWeight: "600", marginTop: "4.5px" }}>
            Forgot Password?
          </a>
        </div>

        <button
          type="submit"
          className={styles.btn}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className={styles.footer}>
        <span>Need an account? Contact system administrator or <a href="/register" className={styles.link}>Register Admin Account</a>.</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.glowBlob1} />
      <div className={styles.glowBlob2} />
      <Suspense fallback={
        <div className={styles.card} style={{ alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Loading login form...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
