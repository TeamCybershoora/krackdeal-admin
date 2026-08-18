"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Ban, 
  AlertTriangle, 
  CheckCircle,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Heart,
  UserCheck,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../admin.module.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | ACTIVE | SUSPENDED | BLOCKED
  const [sortParam, setSortParam] = useState("newest"); // newest | oldest
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Drawer & Action modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, user: null, action: "" });
  const [savingAction, setSavingAction] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const url = `/API/admin/users?page=${currentPage}&limit=8&search=${encodeURIComponent(searchQuery)}&status=${statusFilter}&sort=${sortParam}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        if (data.pagination) {
          setTotalPages(data.pagination.pages || 1);
          setTotalItems(data.pagination.total || 0);
        }
      } else {
        setMessage({ text: data.message || "Failed to load users.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Network error. Failed to load users.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, sortParam, currentPage]);

  const handleAction = async () => {
    if (!confirmModal.user || !confirmModal.action) return;
    setSavingAction(true);
    try {
      let res;
      if (confirmModal.action === "delete") {
        res = await fetch(`/API/admin/users?id=${confirmModal.user._id}`, {
          method: "DELETE"
        });
      } else {
        res = await fetch(`/API/admin/users`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: confirmModal.user._id,
            status: confirmModal.action
          })
        });
      }

      const data = await res.json();
      if (data.success) {
        setMessage({ text: `User status updated to ${confirmModal.action.toUpperCase()} successfully.`, type: "success" });
        setConfirmModal({ show: false, user: null, action: "" });
        fetchUsers();
      } else {
        setMessage({ text: data.message || "Action failed.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Server error occurred while updating user.", type: "error" });
    } finally {
      setSavingAction(false);
    }
  };

  return (
    <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.5px" }}>
            Customer Management
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
            View, moderate, and monitor registered buyers and shoppers across KrackDeal.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ background: "rgba(35, 35, 35, 0.72)", border: "1px solid rgba(255,255,255,0.06)", padding: "10px 16px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
            <User size={16} style={{ color: "var(--primary-light)" }} />
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#ffffff" }}>{totalItems} Total Customers</span>
          </div>
        </div>
      </div>

      {/* Alert toast */}
      {message.text && (
        <div style={{ 
          padding: "12px 18px", 
          borderRadius: "12px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          fontSize: "13px",
          fontWeight: "600",
          backgroundColor: message.type === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
          border: `1px solid ${message.type === "error" ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"}`,
          color: message.type === "error" ? "#ef4444" : "#10b981"
        }}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: "", type: "" })} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Table Container Card */}
      <div className={styles.adminCard} style={{ padding: "0", overflow: "hidden" }}>
        {/* Controls Toolbar */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          {/* Search bar */}
          <div style={{ position: "relative", width: "320px" }}>
            <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            <input
              type="text"
              placeholder="Search by name, email, city..."
              value={searchQuery}
              onChange={(e) => { setCurrentPage(1); setSearchQuery(e.target.value); }}
              style={{
                width: "100%",
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "8px 14px 8px 38px",
                color: "#ffffff",
                fontSize: "13px",
                outline: "none"
              }}
            />
          </div>

          {/* Filter dropdowns */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <select
              value={statusFilter}
              onChange={(e) => { setCurrentPage(1); setStatusFilter(e.target.value); }}
              style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)", color: "#ffffff", padding: "8px 12px", borderRadius: "10px", fontSize: "13px", outline: "none", cursor: "pointer" }}
            >
              <option value="ALL">All Account Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BLOCKED">Blocked</option>
            </select>

            <select
              value={sortParam}
              onChange={(e) => { setCurrentPage(1); setSortParam(e.target.value); }}
              style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)", color: "#ffffff", padding: "8px 12px", borderRadius: "10px", fontSize: "13px", outline: "none", cursor: "pointer" }}
            >
              <option value="newest">Newest Users</option>
              <option value="oldest">Oldest Users</option>
            </select>
          </div>
        </div>

        {/* Users Table / Skeleton */}
        {loading ? (
          <div className={styles.adminTableWrapper}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Location</th>
                  <th>Claims</th>
                  <th>Redemptions</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <tr key={i}>
                    <td><div className={styles.skeletonCircle} style={{ width: "36px", height: "36px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "120px", height: "16px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "160px", height: "14px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "90px", height: "14px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "60px", height: "14px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "50px", height: "14px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "70px", height: "14px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "65px", height: "22px", borderRadius: "99px" }} /></td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <div className={styles.skeletonLine} style={{ width: "30px", height: "30px", borderRadius: "8px" }} />
                        <div className={styles.skeletonLine} style={{ width: "30px", height: "30px", borderRadius: "8px" }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div className={styles.adminTableWrapper}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Profile</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Location</th>
                    <th>Claims</th>
                    <th>Redemptions</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center", color: "#64748b", padding: "40px 0" }}>
                        No customers found matching search filters.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const initials = u.name ? u.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "U";
                      return (
                        <tr key={u._id}>
                          <td>
                            {u.image ? (
                              <img 
                                src={u.image} 
                                alt={u.name} 
                                style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.06)" }}
                              />
                            ) : (
                              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: "var(--primary-light)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                {initials}
                              </div>
                            )}
                          </td>
                          <td style={{ fontWeight: "700", color: "#ffffff" }}>{u.name}</td>
                          <td style={{ color: "#94a3b8" }}>{u.email}</td>
                          <td style={{ color: "#e2e8f0", fontSize: "13px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <MapPin size={12} style={{ color: "#64748b" }} />
                              <span>{u.location || "Delhi, IN"}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: "600" }}>{u.couponsClaimed || 0} claimed</td>
                          <td style={{ fontWeight: "600" }}>{u.dealsUsed || 0} used</td>
                          <td style={{ fontSize: "12px", color: "#64748b" }}>
                            {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                          </td>
                          <td>
                            <span 
                              style={{ 
                                padding: "4px 10px", 
                                borderRadius: "99px", 
                                fontSize: "10px", 
                                fontWeight: "800", 
                                textTransform: "uppercase", 
                                letterSpacing: "0.5px",
                                backgroundColor: u.status === "BLOCKED" ? "rgba(239,68,68,0.08)" : u.status === "SUSPENDED" ? "rgba(249,115,22,0.08)" : "rgba(16,185,129,0.08)",
                                border: `1px solid ${u.status === "BLOCKED" ? "rgba(239,68,68,0.2)" : u.status === "SUSPENDED" ? "rgba(249,115,22,0.2)" : "rgba(16,185,129,0.2)"}`,
                                color: u.status === "BLOCKED" ? "#ef4444" : u.status === "SUSPENDED" ? "#f97316" : "#10b981"
                              }}
                            >
                              {u.status || "ACTIVE"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "8px" }}>
                              <button 
                                className={styles.btnIcon} 
                                onClick={() => setSelectedUser(u)}
                                title="View Customer Profile Drawer"
                                style={{ color: "var(--primary-light)", borderColor: "rgba(155,107,255,0.15)" }}
                              >
                                <Eye size={14} />
                              </button>
                              <button 
                                className={styles.btnIcon}
                                onClick={() => setConfirmModal({ show: true, user: u, action: "delete" })}
                                style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.15)" }}
                                title="Delete User Account"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Showing Page {currentPage} of {totalPages} ({totalItems} total users)
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={styles.btnIcon}
                    style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={styles.btnIcon}
                    style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* USER DETAILS SLIDE-IN DRAWER */}
      <AnimatePresence>
        {selectedUser && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: "flex-end" }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{
                position: "relative",
                width: "440px",
                maxWidth: "100vw",
                height: "100%",
                background: "#1e1e1e",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
                padding: "32px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                boxShadow: "-10px 0 40px rgba(0,0,0,0.5)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff" }}>Customer Details</h3>
                <button onClick={() => setSelectedUser(null)} className={styles.btnIcon}>
                  <X size={16} />
                </button>
              </div>

              {/* Profile Card in Drawer */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "20px", borderRadius: "16px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(139, 92, 246, 0.2)", border: "2px solid var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "800", color: "#ffffff" }}>
                  {selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", margin: 0 }}>{selectedUser.name}</h4>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>{selectedUser.email}</span>
                  <div style={{ marginTop: "6px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "6px", background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                      {selectedUser.status || "ACTIVE"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info fields list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#cbd5e1" }}>
                  <Mail size={16} style={{ color: "#64748b" }} />
                  <span>{selectedUser.email}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#cbd5e1" }}>
                  <Phone size={16} style={{ color: "#64748b" }} />
                  <span>{selectedUser.phone || "No phone linked"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#cbd5e1" }}>
                  <MapPin size={16} style={{ color: "#64748b" }} />
                  <span>{selectedUser.location || "Delhi, India"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#cbd5e1" }}>
                  <Calendar size={16} style={{ color: "#64748b" }} />
                  <span>Joined on {new Date(selectedUser.createdAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {selectedUser.status === "BLOCKED" ? (
                  <button 
                    onClick={() => setConfirmModal({ show: true, user: selectedUser, action: "ACTIVE" })}
                    style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "#10b981", color: "#ffffff", border: "none", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    <UserCheck size={16} /> Unblock Customer Account
                  </button>
                ) : (
                  <button 
                    onClick={() => setConfirmModal({ show: true, user: selectedUser, action: "BLOCKED" })}
                    style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    <Ban size={16} /> Block Customer Account
                  </button>
                )}
                
                <button 
                  onClick={() => setConfirmModal({ show: true, user: selectedUser, action: "delete" })}
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "none", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <Trash2 size={16} /> Delete Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION DIALOG MODAL */}
      {confirmModal.show && (
        <div style={{ position: "fixed", inset: 0, zIndex: 110, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#202020", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "28px", maxWidth: "420px", width: "90%", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: confirmModal.action === "delete" || confirmModal.action === "BLOCKED" ? "#ef4444" : "#10b981" }}>
              <AlertTriangle size={24} />
              <h4 style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", margin: 0 }}>Confirm Action</h4>
            </div>

            <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>
              Are you sure you want to {confirmModal.action.toLowerCase()} user account <strong>"{confirmModal.user?.name}"</strong>?
            </p>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button 
                onClick={handleAction}
                disabled={savingAction}
                style={{ flex: 1, padding: "10px", borderRadius: "10px", background: confirmModal.action === "delete" || confirmModal.action === "BLOCKED" ? "#ef4444" : "#10b981", color: "#ffffff", border: "none", fontWeight: "700", cursor: "pointer" }}
              >
                {savingAction ? "Processing..." : "Confirm"}
              </button>
              <button 
                onClick={() => setConfirmModal({ show: false, user: null, action: "" })}
                style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.1)", fontWeight: "600", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
