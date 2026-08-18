"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Grid, 
  Users, 
  Ticket, 
  Settings, 
  LogOut, 
  Flame, 
  Store 
} from "lucide-react";
import { motion } from "framer-motion";
import styles from "../admin.module.css";
import { useAuth } from "@/app/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  
  const avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop";

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/category", icon: Grid },
    { label: "KrackDeal Partners", href: "/admin/partners", icon: Store },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Coupons", href: "/admin/coupons", icon: Ticket },
    { label: "Settings", href: "/admin/settings", icon: Settings }
  ];

  const isLinkActive = (href) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.aside 
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={styles.sidebar}
    >
      <div className={styles.logoSection}>
        <Flame size={26} className={styles.logoIcon} />
        <span className={styles.logoText}>KrackDeal Admin</span>
      </div>

      <nav className={styles.navigationList}>
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const active = isLinkActive(item.href);
          return (
            <motion.div
              key={item.href}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
            >
              <Link 
                href={item.href} 
                className={`${styles.navLink} ${active ? styles.activeNavLink : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Floating profile avatar block matching reference image */}
      <div className={styles.sidebarFooter}>
        <div className={styles.sidebarProfileCard}>
          <img 
            src={avatarUrl} 
            alt={user?.name || "Admin"} 
            className={styles.sidebarAvatar} 
          />
          <div className={styles.sidebarProfileInfo}>
            <span className={styles.sidebarProfileName}>{user?.name || "Admin User"}</span>
            <span className={styles.sidebarProfileRole}>{user?.role || "Administrator"}</span>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, color: "var(--accent-red)" }}
            whileTap={{ scale: 0.95 }}
            onClick={logout} 
            className={styles.btnIcon} 
            style={{ padding: "6px", border: "none", background: "rgba(255,255,255,0.02)" }}
            title="Logout"
          >
            <LogOut size={15} />
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
}
