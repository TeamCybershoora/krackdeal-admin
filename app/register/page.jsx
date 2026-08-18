"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { isValidEmail } from "@/app/util/validators";
import styles from "../login/login.module.css";
import DynamicData from "../util/Dynamicdata";
import { ENV } from "@/config/env";

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, user, loading } = useAuth();
  const router = useRouter();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "seller") {
        window.location.href = `${ENV.PARTNER_URL}/partner`;
      } else {
        window.location.href = `${ENV.STORE_URL}/`;
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !password) {
      setFormError("All fields are required.");
      return;
    }

    if (cleanName.length < 2) {
      setFormError("Please enter a valid full name (minimum 2 characters).");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setFormError("Please enter a valid email address format (e.g. admin@krackdeal.com).");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/API/auth/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: cleanName, 
          email: cleanEmail.toLowerCase(), 
          password 
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        router.push(`/verify?email=${encodeURIComponent(cleanEmail)}`);
      } else {
        setFormError(data.message || "Registration failed");
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
      <a href="/login" className={styles.link} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", marginBottom: "20px", width: "fit-content" }}>
        <ArrowLeft size={14} />
        <span>Back to Login</span>
      </a>

      {/* Brand Header */}
      <div className={styles.header}>
        <div className={styles.logoWrapper} onClick={() => router.push("/login")}>
          <div className={styles.logoIcon}>D</div>
          <span className={styles.logoText}>
            {DynamicData.Logoheading}<span className={styles.logoDot}>.</span>
          </span>
        </div>
        <h2 className={styles.title}>Register Administrator</h2>
        <p className={styles.subtitle}>Create a new Super Admin dashboard login</p>
      </div>

      {/* Error Alert */}
      {formError && (
        <div className={styles.errorAlert} style={{ marginBottom: "20px" }}>
          <AlertCircle size={16} />
          <span>{formError}</span>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <User size={14} />
            <span>Full Name</span>
          </label>
          <div className={styles.inputWrapper}>
            <User size={16} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="e.g. Raviraj Singh"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <Mail size={14} />
            <span>Email Address</span>
          </label>
          <div className={styles.inputWrapper}>
            <Mail size={16} className={styles.inputIcon} />
            <input
              type="email"
              placeholder="name@krackdeal.com"
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
        </div>

        <button
          type="submit"
          className={styles.btn}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className={styles.footer}>
        <span>Already have an account? <a href="/login" className={styles.link}>Sign In</a>.</span>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className={styles.container}>
      <div className={styles.glowBlob1} />
      <div className={styles.glowBlob2} />
      <Suspense fallback={
        <div className={styles.card} style={{ alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Loading registration form...</p>
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
