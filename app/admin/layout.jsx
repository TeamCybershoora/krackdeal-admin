"use client";

import { useAuth } from "@/app/context/AuthContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import styles from "./admin.module.css";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className={styles.deniedContainer}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(250, 204, 21, 0.1)",
          borderTopColor: "#fbbf24",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Access validation checks
  const isAdmin = user && user.role === "admin";
  const isBlocked = user && user.status === "BLOCKED";
  const isSuspended = user && user.status === "SUSPENDED";

  if (!user || !isAdmin || isBlocked || isSuspended) {
    let deniedTitle = "Access Restricted";
    let deniedMessage = "Please log in to your account to view your dashboard.";
    
    if (isBlocked) {
      deniedTitle = "Account Blocked";
      deniedMessage = "Your account has been BLOCKED. Access to the dashboard is disabled.";
    } else if (isSuspended) {
      deniedTitle = "Account Suspended";
      deniedMessage = "Your Partner Account has been suspended. Please contact KrackDeal Support.";
    } else if (user && !isAdmin) {
      deniedTitle = "Admin Access Restricted";
      deniedMessage = "Please log in with a Super Admin account to access the control panel.";
    }

    return (
      <div className={styles.deniedContainer}>
        <ShieldAlert size={64} className={styles.deniedIcon} style={{ color: (isBlocked || isSuspended) ? "#ef4444" : "#fbbf24" }} />
        <h2 className={styles.deniedTitle}>{deniedTitle}</h2>
        <p className={styles.deniedMessage}>{deniedMessage}</p>
        <div style={{ display: "flex", gap: "16px" }}>
          {(!isBlocked && !isSuspended) && (
            <Link href="/" className={styles.btnPrimary} style={{ textDecoration: "none" }}>
              Return to Home
            </Link>
          )}
          <Link 
            href="/login" 
            className={styles.btnPrimary} 
            style={{ 
              background: "rgba(255,255,255,0.05)", 
              border: "1px solid rgba(255,255,255,0.1)", 
              color: "#ffffff",
              textDecoration: "none"
            }}
          >
            {user ? "Switch Account" : "Log In"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Header />
        <main className={styles.pageBody}>
          {children}
        </main>
      </div>
    </div>
  );
}
