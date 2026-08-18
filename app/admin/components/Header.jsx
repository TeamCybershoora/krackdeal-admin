"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Bell, Search } from "lucide-react";
import { motion } from "framer-motion";
import styles from "../admin.module.css";

export default function Header() {
  const { user } = useAuth();
  
  // Standard avatar placeholder
  const avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop";

  return (
    <motion.header 
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={styles.header}
    >
      <div className={styles.searchBar}>
        <Search size={18} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search stats, coupons, users..." 
          className={styles.searchInput} 
        />
      </div>

      <div className={styles.profileSection}>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={styles.notificationBtn} 
          aria-label="Notifications"
        >
          <Bell size={18} />
          {/* Notification dot indicator */}
          <span style={{
            position: "absolute",
            top: "2px",
            right: "2px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "var(--primary)",
            boxShadow: "0 0 8px var(--primary)"
          }} />
        </motion.button>

        <div className={styles.userProfile}>
          <img 
            src={avatarUrl} 
            alt={user?.name || "Admin User"} 
            className={styles.profileAvatar} 
          />
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{user?.name || "Admin"}</span>
            <span className={styles.profileRole}>{user?.role || "Administrator"}</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
