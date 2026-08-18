"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Trash2, 
  Ban, 
  AlertTriangle, 
  CheckCircle,
  X,
  Store,
  User,
  Mail,
  Phone,
  FileText,
  MapPin,
  Calendar,
  Shield,
  Activity,
  FileCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../admin.module.css";

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
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
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, partner: null, action: "" });
  const [savingAction, setSavingAction] = useState(false);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const url = `/API/admin/partners?page=${currentPage}&limit=8&search=${encodeURIComponent(searchQuery)}&status=${statusFilter}&sort=${sortParam}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPartners(data.partners || []);
        if (data.pagination) {
          setTotalPages(data.pagination.pages || 1);
          setTotalItems(data.pagination.total || 0);
        }
      } else {
        setMessage({ text: data.message || "Failed to load partners.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Network error. Failed to load partners.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [currentPage, statusFilter, sortParam]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      fetchPartners();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleActionConfirm = async () => {
    if (!confirmModal.partner || !confirmModal.action) return;
    setSavingAction(true);
    setMessage({ text: "", type: "" });

    const p = confirmModal.partner;
    const action = confirmModal.action;
    let statusUpdate = "";
    let apiAction = "update-status";

    if (action === "suspend") statusUpdate = "SUSPENDED";
    else if (action === "block") statusUpdate = "BLOCKED";
    else if (action === "unblock" || action === "restore" || action === "approve") statusUpdate = "ACTIVE";
    else if (action === "delete") apiAction = "delete";

    try {
      const res = await fetch("/API/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId: p._id,
          action: apiAction,
          status: statusUpdate
        })
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ 
          text: `Partner "${p.storeName}" has been successfully ${action === "delete" ? "deleted" : action + "ed"}!`, 
          type: "success" 
        });
        setConfirmModal({ show: false, partner: null, action: "" });
        setSelectedPartner(null); // Close drawer if open
        fetchPartners();
      } else {
        setMessage({ text: data.message || "Operation failed.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Network error occurred.", type: "error" });
    } finally {
      setSavingAction(false);
    }
  };

  return (
    <div className={styles.dashboardGrid}>
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: "800" }}>KrackDeal Partners</h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
          Monitor, verify, suspend, and block registered merchant store profiles.
        </p>
      </div>

      {message.text && (
        <div style={{
          padding: "14px 18px",
          borderRadius: "14px",
          marginTop: "16px",
          backgroundColor: message.type === "success" ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
          border: `1px solid ${message.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
          color: message.type === "success" ? "#34d399" : "#f87171",
          fontSize: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {message.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage({ text: "", type: "" })} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "18px" }}>&times;</button>
        </div>
      )}

      {/* Main Partners Table Container */}
      <div className={styles.glassCard} style={{ marginTop: "24px", padding: "24px" }}>
        
        {/* Filters and search block */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "6px 14px", width: "100%", maxWidth: "320px" }}>
            <Search size={16} style={{ color: "#475569" }} />
            <input 
              type="text" 
              placeholder="Search store name, email, owner..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: "transparent", border: "none", outline: "none", color: "#ffffff", width: "100%", fontSize: "13px" }}
            />
          </div>

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
              onChange={(e) => { setCurrentPage(1); setSortBy(e.target.value); }}
              style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)", color: "#ffffff", padding: "8px 12px", borderRadius: "10px", fontSize: "13px", outline: "none", cursor: "pointer" }}
            >
              <option value="newest">Newest Partners</option>
              <option value="oldest">Oldest Partners</option>
            </select>
          </div>
        </div>

        {/* Partners Table / Skeleton */}
        {loading ? (
          <div className={styles.adminTableWrapper}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Store Name</th>
                  <th>Owner</th>
                  <th>Business Email</th>
                  <th>Phone</th>
                  <th>Deals</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <tr key={i}>
                    <td><div className={styles.skeletonCircle} style={{ width: "36px", height: "36px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "130px", height: "16px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "100px", height: "14px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "150px", height: "14px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "90px", height: "14px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "50px", height: "14px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "65px", height: "22px", borderRadius: "99px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "70px", height: "14px" }} /></td>
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
                    <th>Store</th>
                    <th>Store Name</th>
                    <th>Owner</th>
                    <th>Business Email</th>
                    <th>Phone</th>
                    <th>Deals</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center", color: "#64748b", padding: "40px 0" }}>
                        No registered partners match search criteria.
                      </td>
                    </tr>
                  ) : (
                    partners.map((p) => {
                      const initials = p.storeName ? p.storeName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "SP";
                      return (
                        <tr key={p._id}>
                          <td>
                            {p.logoUrl ? (
                              <img 
                                src={p.logoUrl} 
                                alt={p.storeName} 
                                style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.06)" }}
                              />
                            ) : (
                              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: "var(--primary-light)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                {initials}
                              </div>
                            )}
                          </td>
                          <td style={{ fontWeight: "700", color: "#ffffff" }}>{p.storeName}</td>
                          <td style={{ color: "#e2e8f0" }}>{p.ownerName}</td>
                          <td style={{ color: "#94a3b8" }}>{p.email}</td>
                          <td style={{ color: "#94a3b8" }}>{p.phone}</td>
                          <td style={{ fontWeight: "600" }}>{p.dealsCount} deals</td>
                          <td>
                            <span 
                              style={{ 
                                padding: "4px 10px", 
                                borderRadius: "99px", 
                                fontSize: "10px", 
                                fontWeight: "800", 
                                textTransform: "uppercase", 
                                letterSpacing: "0.5px",
                                backgroundColor: p.status === "BLOCKED" ? "rgba(239,68,68,0.08)" : p.status === "SUSPENDED" ? "rgba(249,115,22,0.08)" : "rgba(16,185,129,0.08)",
                                border: `1px solid ${p.status === "BLOCKED" ? "rgba(239,68,68,0.2)" : p.status === "SUSPENDED" ? "rgba(249,115,22,0.2)" : "rgba(16,185,129,0.2)"}`,
                                color: p.status === "BLOCKED" ? "#ef4444" : p.status === "SUSPENDED" ? "#f97316" : "#10b981"
                              }}
                            >
                              {p.status || "ACTIVE"}
                            </span>
                          </td>
                          <td style={{ fontSize: "12px", color: "#64748b" }}>
                            {new Date(p.joinedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "8px" }}>
                              <button 
                                className={styles.btnIcon} 
                                onClick={() => setSelectedPartner(p)}
                                title="View Store Details Drawer"
                                style={{ color: "var(--primary-light)", borderColor: "rgba(155,107,255,0.15)" }}
                              >
                                <Eye size={14} />
                              </button>
                              <button 
                                className={styles.btnIcon}
                                onClick={() => handleDeleteCat(p._id)}
                                style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.15)" }}
                                onClick={() => setConfirmModal({ show: true, partner: p, action: "delete" })}
                                title="Delete Partner"
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px" }}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Showing <strong style={{ color: "#ffffff" }}>{partners.length}</strong> of <strong style={{ color: "#ffffff" }}>{totalItems}</strong> partners
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={styles.btnIcon}
                    style={{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ display: "flex", alignItems: "center", padding: "0 12px", fontSize: "13px", fontWeight: "600", color: "#ffffff" }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={styles.btnIcon}
                    style={{ opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Slide-out Right Drawer */}
      <AnimatePresence>
        {selectedPartner && (
          <>
            {/* Dark backdrop overlay */}
            <div 
              onClick={() => setSelectedPartner(null)} 
              style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 999 }} 
            />

            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                width: "100%",
                maxWidth: "460px",
                height: "100vh",
                background: "#26201C",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
                zIndex: 1000,
                boxShadow: "-15px 0 45px rgba(0,0,0,0.6)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}
            >
              {/* Drawer Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Store size={20} style={{ color: "var(--primary-light)" }} />
                  <span style={{ fontWeight: "800", color: "#ffffff", fontSize: "16px" }}>Partner Profile Details</span>
                </div>
                <button 
                  onClick={() => setSelectedPartner(null)} 
                  style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "4px" }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div style={{ padding: "24px", overflowY: "auto", flexGrow: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Store Profile Card */}
                <div style={{ display: "flex", gap: "16px", alignItems: "center", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  {selectedPartner.logoUrl ? (
                    <img 
                      src={selectedPartner.logoUrl} 
                      alt={selectedPartner.storeName} 
                      style={{ width: "64px", height: "64px", borderRadius: "12px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                  ) : (
                    <div style={{ width: "64px", height: "64px", borderRadius: "12px", background: "rgba(155,107,255,0.08)", border: "1px solid rgba(155,107,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-light)", fontSize: "20px", fontWeight: "800" }}>
                      {selectedPartner.storeName ? selectedPartner.storeName[0].toUpperCase() : "S"}
                    </div>
                  )}
                  <div>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#ffffff" }}>{selectedPartner.storeName}</h3>
                    <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>{selectedPartner.ownerName}</p>
                    <div style={{ marginTop: "6px" }}>
                      <span 
                        style={{ 
                          padding: "3px 8px", 
                          borderRadius: "99px", 
                          fontSize: "9px", 
                          fontWeight: "800", 
                          textTransform: "uppercase", 
                          letterSpacing: "0.5px",
                          backgroundColor: selectedPartner.status === "BLOCKED" ? "rgba(239,68,68,0.08)" : selectedPartner.status === "SUSPENDED" ? "rgba(249,115,22,0.08)" : "rgba(16,185,129,0.08)",
                          border: `1px solid ${selectedPartner.status === "BLOCKED" ? "rgba(239,68,68,0.2)" : selectedPartner.status === "SUSPENDED" ? "rgba(249,115,22,0.2)" : "rgba(16,185,129,0.2)"}`,
                          color: selectedPartner.status === "BLOCKED" ? "#ef4444" : selectedPartner.status === "SUSPENDED" ? "#f97316" : "#10b981"
                        }}
                      >
                        {selectedPartner.status || "ACTIVE"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div>
                  <h4 style={{ color: "var(--primary-light)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700", marginBottom: "12px" }}>Owner Information</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Owner Name</span>
                      <span style={{ color: "#e2e8f0", fontWeight: "600" }}>{selectedPartner.ownerName}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Business Email</span>
                      <span style={{ color: "#e2e8f0", fontWeight: "600" }}>{selectedPartner.email}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Phone Helpline</span>
                      <span style={{ color: "#e2e8f0", fontWeight: "600" }}>{selectedPartner.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Store Details */}
                <div>
                  <h4 style={{ color: "var(--primary-light)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700", marginBottom: "12px" }}>Store Details</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Business Address</span>
                      <span style={{ color: "#e2e8f0", fontWeight: "600", textAlign: "right", maxWidth: "240px" }}>{selectedPartner.address}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>GSTIN Tax ID</span>
                      <span style={{ color: "#e2e8f0", fontWeight: "700", fontFamily: "monospace" }}>{selectedPartner.gst || "NOT PROVIDED"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Permanent Account Number (PAN)</span>
                      <span style={{ color: "#e2e8f0", fontWeight: "700", fontFamily: "monospace" }}>{selectedPartner.pan || "NOT PROVIDED"}</span>
                    </div>
                  </div>
                </div>

                {/* Operations */}
                <div>
                  <h4 style={{ color: "var(--primary-light)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700", marginBottom: "12px" }}>Activity Summary</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Total Active Deals</span>
                      <span style={{ color: "#ffffff", fontWeight: "700" }}>{selectedPartner.dealsCount} deals</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Redeemable Coupons</span>
                      <span style={{ color: "#ffffff", fontWeight: "700" }}>{selectedPartner.totalCoupons} coupons</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Joined Platform</span>
                      <span style={{ color: "#94a3b8" }}>{new Date(selectedPartner.joinedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Last Server Session</span>
                      <span style={{ color: "#94a3b8" }}>{selectedPartner.lastLogin ? new Date(selectedPartner.lastLogin).toLocaleString() : "Never logged in"}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Documents */}
                <div>
                  <h4 style={{ color: "var(--primary-light)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700", marginBottom: "12px" }}>Uploaded Documents</h4>
                  {selectedPartner.verificationDocs && selectedPartner.verificationDocs.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {selectedPartner.verificationDocs.map((doc, idx) => (
                        <a 
                          key={idx} 
                          href={doc} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)", color: "#ffffff", fontSize: "12px", textDecoration: "none" }}
                        >
                          <FileCheck size={14} style={{ color: "#10b981" }} />
                          <span>View Verification Document #{idx + 1}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "12px" }}>
                      <FileText size={16} />
                      <span>No verification documentation uploads found.</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", gap: "12px" }}>
                
                {/* Account Status Control Buttons */}
                <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                  {selectedPartner.status === "PENDING" && (
                    <button 
                      onClick={() => setConfirmModal({ show: true, partner: selectedPartner, action: "approve" })}
                      style={{ flexGrow: 2, padding: "10px 14px", borderRadius: "10px", background: "rgba(70,211,154,0.15)", border: "1px solid rgba(70,211,154,0.3)", color: "var(--accent-green)", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}
                    >
                      ✅ Approve Partner
                    </button>
                  )}

                  {selectedPartner.status === "ACTIVE" && (
                    <button 
                      onClick={() => setConfirmModal({ show: true, partner: selectedPartner, action: "suspend" })}
                      style={{ flexGrow: 1, padding: "10px 14px", borderRadius: "10px", background: "rgba(246,183,77,0.1)", border: "1px solid rgba(246,183,77,0.2)", color: "var(--accent-orange)", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}
                    >
                      ⚠️ Suspend Profile
                    </button>
                  )}

                  {selectedPartner.status === "SUSPENDED" && (
                    <button 
                      onClick={() => setConfirmModal({ show: true, partner: selectedPartner, action: "approve" })}
                      style={{ flexGrow: 1, padding: "10px 14px", borderRadius: "10px", background: "rgba(70,211,154,0.15)", border: "1px solid rgba(70,211,154,0.3)", color: "var(--accent-green)", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}
                    >
                      ✅ Activate Profile
                    </button>
                  )}

                  {selectedPartner.status !== "BLOCKED" ? (
                    <button 
                      onClick={() => setConfirmModal({ show: true, partner: selectedPartner, action: "block" })}
                      style={{ flexGrow: 1, padding: "10px 14px", borderRadius: "10px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", color: "var(--accent-red)", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}
                    >
                      🛑 Block Account
                    </button>
                  ) : (
                    <button 
                      onClick={() => setConfirmModal({ show: true, partner: selectedPartner, action: "unblock" })}
                      style={{ flexGrow: 1, padding: "10px 14px", borderRadius: "10px", background: "rgba(70,211,154,0.15)", border: "1px solid rgba(70,211,154,0.3)", color: "var(--accent-green)", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}
                    >
                      ✅ Restore Profile
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => setConfirmModal({ show: true, partner: selectedPartner, action: "delete" })}
                  style={{ padding: "10px", borderRadius: "10px", background: "none", border: "1px dashed rgba(239,68,68,0.2)", color: "#f87171", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                >
                  Delete Merchant Record
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "20px" }}>
          <div style={{ background: "#26201C", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", width: "100%", maxWidth: "440px", padding: "24px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ background: "rgba(239,68,68,0.1)", padding: "10px", borderRadius: "12px", color: "#ef4444" }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#ffffff" }}>
                  Confirm Account {confirmModal.action === "approve" ? "APPROVAL" : confirmModal.action.toUpperCase()}
                </h3>
                <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#94a3b8", lineHeight: "1.5" }}>
                  {confirmModal.action === "approve" && `Are you sure you want to approve "${confirmModal.partner.storeName}"? This will activate their store profile, allow them to publish listings, and redeem deals.`}
                  {confirmModal.action === "suspend" && `Are you sure you want to suspend "${confirmModal.partner.storeName}"? They will not be able to log in, list deals, or redeem vouchers.`}
                  {confirmModal.action === "block" && `Are you sure you want to block "${confirmModal.partner.storeName}"? Their dashboard, APIs, and credentials will be fully deactivated. They will no longer be able to log in.`}
                  {confirmModal.action === "unblock" && `Are you sure you want to restore "${confirmModal.partner.storeName}"? This will activate their portal logins and list active deals.`}
                  {confirmModal.action === "delete" && `Permanently delete "${confirmModal.partner.storeName}"? This deletes the partner profile, account logins, and all deals created. This action is irreversible.`}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button 
                type="button" 
                className={styles.btnSecondary} 
                onClick={() => setConfirmModal({ show: false, partner: null, action: "" })} 
                style={{ width: "50%" }}
                disabled={savingAction}
              >
                Cancel
              </button>
              <button 
                onClick={handleActionConfirm}
                style={{ 
                  width: "50%",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  color: "#ffffff",
                  background: confirmModal.action === "delete" || confirmModal.action === "block" ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" : confirmModal.action === "suspend" ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" : "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                }}
                disabled={savingAction}
              >
                {savingAction ? "Processing..." : confirmModal.action.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
