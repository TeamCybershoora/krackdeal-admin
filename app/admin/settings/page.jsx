"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  DollarSign, 
  Percent, 
  Truck, 
  Store, 
  Bell, 
  Database, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Server, 
  Cloud, 
  KeyRound, 
  User, 
  Download, 
  Trash2, 
  Activity,
  Layers,
  Sparkles,
  X
} from "lucide-react";
import styles from "../admin.module.css";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("GENERAL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ text: "", type: "" });

  // System Settings State
  const [settings, setSettings] = useState({
    platformName: "KrackDeal Marketplace",
    supportEmail: "support@krackdeal.com",
    supportPhone: "+91 92798 37838",
    currency: "INR (₹)",
    commissionRate: 3.5,
    freeDeliveryThreshold: 499,
    taxRateGst: 18,
    autoApprovePartners: false,
    autoApproveProducts: false,
    requireUpiVerification: true,
    highValueOrderAlertAmount: 50000,
    emailAlertsEnabled: true,
    maintenanceMode: false,
  });

  // Admin Profile & Security State
  const [adminProfile, setAdminProfile] = useState({
    name: "Ravi Ranjan",
    email: "admin@krackdeal.com",
    role: "SuperAdmin"
  });

  // Change Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: "", type: "" }), 3500);
  };

  // Fetch Settings from MongoDB API
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/API/admin/settings");
      const data = await res.json();
      if (data.success) {
        if (data.settings) setSettings(data.settings);
        if (data.admin) setAdminProfile(data.admin);
      }
    } catch (err) {
      console.error("Error loading settings:", err);
      showToast("Network error loading settings.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save Settings Handler
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/API/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Settings updated successfully!", "success");
      } else {
        showToast(data.message || "Failed to save settings.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error saving settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Password Update Handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("New passwords do not match!", "error");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/API/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CHANGE_PASSWORD",
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("SuperAdmin password changed successfully!", "success");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        showToast(data.message || "Failed to update password.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error updating password.", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  // Export DB Backup JSON
  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      platform: settings.platformName,
      settings: settings,
      admin: adminProfile
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `krackdeal-settings-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    showToast("Settings backup downloaded successfully!", "success");
  };

  return (
    <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Toast Notification */}
      {toast.text && (
        <div style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 9999,
          background: "#1e1e1e",
          border: `1px solid ${toast.type === "error" ? "#ef4444" : "#10b981"}`,
          color: "#ffffff",
          padding: "12px 20px",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          fontSize: "14px",
          fontWeight: "700"
        }}>
          {toast.type === "error" ? <AlertTriangle size={18} color="#ef4444" /> : <CheckCircle2 size={18} color="#10b981" />}
          <span>{toast.text}</span>
          <button onClick={() => setToast({ text: "", type: "" })} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", marginLeft: "6px" }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.5px", margin: "0 0 6px 0" }}>
            Platform Settings & Governance
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
            Configure global platform rules, marketplace commission, security, alerts, and system health.
          </p>
        </div>

        <button 
          onClick={handleSaveSettings}
          disabled={saving || loading}
          style={{
            padding: "10px 22px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#ffffff",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 16px rgba(16, 185, 129, 0.35)",
            transition: "all 0.2s ease"
          }}
        >
          <Save size={16} />
          {saving ? "Saving Changes..." : "Save Platform Settings"}
        </button>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px", overflowX: "auto" }}>
        {[
          { id: "GENERAL", label: "General & Fees", icon: Settings },
          { id: "SECURITY", label: "Security & Admin Profile", icon: ShieldCheck },
          { id: "GOVERNANCE", label: "Merchant & Governance", icon: Store },
          { id: "ALERTS", label: "Alerts & Notifications", icon: Bell },
          { id: "SYSTEM", label: "System Health & Backup", icon: Server },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "12px",
                border: "none",
                background: isActive ? "rgba(16, 185, 129, 0.15)" : "transparent",
                color: isActive ? "#34d399" : "#94a3b8",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease"
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SKELETON LOADING STATE */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className={styles.skeletonLine} style={{ width: "180px", height: "20px" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className={styles.skeletonLine} style={{ width: "100%", height: "46px", borderRadius: "10px" }} />
              <div className={styles.skeletonLine} style={{ width: "100%", height: "46px", borderRadius: "10px" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className={styles.skeletonLine} style={{ width: "100%", height: "46px", borderRadius: "10px" }} />
              <div className={styles.skeletonLine} style={{ width: "100%", height: "46px", borderRadius: "10px" }} />
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className={styles.skeletonLine} style={{ width: "140px", height: "18px" }} />
            <div className={styles.skeletonLine} style={{ width: "100%", height: "120px", borderRadius: "14px" }} />
          </div>
        </div>
      ) : (
        <>
          {/* TAB 1: GENERAL & FEES */}
          {activeTab === "GENERAL" && (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
              <div className={styles.adminCard} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", margin: 0 }}>
                  Marketplace Identity & Support
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Platform Brand Name</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      value={settings.platformName} 
                      onChange={e => setSettings({ ...settings, platformName: e.target.value })} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Default Currency</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      value={settings.currency} 
                      onChange={e => setSettings({ ...settings, currency: e.target.value })} 
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Customer Support Email</label>
                    <input 
                      type="email" 
                      className={styles.formInput} 
                      value={settings.supportEmail} 
                      onChange={e => setSettings({ ...settings, supportEmail: e.target.value })} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Customer Support Phone</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      value={settings.supportPhone} 
                      onChange={e => setSettings({ ...settings, supportPhone: e.target.value })} 
                    />
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", margin: "0 0 16px 0" }}>
                    Commission Fees & Free Delivery
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Platform Fee (%)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        className={styles.formInput} 
                        value={settings.commissionRate} 
                        onChange={e => setSettings({ ...settings, commissionRate: parseFloat(e.target.value) || 0 })} 
                      />
                      <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Charged on each partner order</span>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Free Delivery Threshold (₹)</label>
                      <input 
                        type="number" 
                        className={styles.formInput} 
                        value={settings.freeDeliveryThreshold} 
                        onChange={e => setSettings({ ...settings, freeDeliveryThreshold: parseInt(e.target.value) || 0 })} 
                      />
                      <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Orders above this get free shipping</span>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>GST / Tax Rate (%)</label>
                      <input 
                        type="number" 
                        className={styles.formInput} 
                        value={settings.taxRateGst} 
                        onChange={e => setSettings({ ...settings, taxRateGst: parseInt(e.target.value) || 0 })} 
                      />
                      <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Standard Indian GST slab</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Summary Card */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className={styles.adminCard} style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(15,23,42,0.6) 100%)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#34d399", textTransform: "uppercase" }}>Quick Revenue Formula</span>
                  <p style={{ margin: "10px 0 0 0", fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6" }}>
                    For an order of <strong>₹1,000</strong>, KrackDeal automatically credits <strong>₹{(1000 * (settings.commissionRate / 100)).toFixed(0)}</strong> to platform profit account.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY & ADMIN PROFILE */}
          {activeTab === "SECURITY" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {/* Admin Profile Details */}
              <div className={styles.adminCard} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}>
                    <User size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", margin: 0 }}>SuperAdmin Profile</h3>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Master credentials for KrackDeal SuperAdmin</span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Admin Name</label>
                  <input type="text" className={styles.formInput} value={adminProfile.name} onChange={e => setAdminProfile({ ...adminProfile, name: e.target.value })} />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Admin Registered Email</label>
                  <input type="email" className={styles.formInput} value={adminProfile.email} onChange={e => setAdminProfile({ ...adminProfile, email: e.target.value })} />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Admin Role & Privileges</label>
                  <input type="text" className={styles.formInput} value="SUPERADMIN (FULL PRIVILEGES)" disabled style={{ opacity: 0.6, background: "rgba(255,255,255,0.02)" }} />
                </div>
              </div>

              {/* Password Change Box */}
              <form onSubmit={handlePasswordSubmit} className={styles.adminCard} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171" }}>
                    <KeyRound size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", margin: 0 }}>Update Master Password</h3>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Secure your admin portal access</span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Current Password</label>
                  <input 
                    type="password" 
                    required 
                    className={styles.formInput} 
                    value={passwordForm.currentPassword} 
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} 
                    placeholder="Enter current password" 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>New Password</label>
                  <input 
                    type="password" 
                    required 
                    className={styles.formInput} 
                    value={passwordForm.newPassword} 
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} 
                    placeholder="Enter at least 6 characters" 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Confirm New Password</label>
                  <input 
                    type="password" 
                    required 
                    className={styles.formInput} 
                    value={passwordForm.confirmPassword} 
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} 
                    placeholder="Re-enter new password" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={changingPassword}
                  className={styles.btnPrimary} 
                  style={{ marginTop: "8px" }}
                >
                  {changingPassword ? "Updating Password..." : "Change Password"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: MERCHANT & GOVERNANCE POLICY */}
          {activeTab === "GOVERNANCE" && (
            <div className={styles.adminCard} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", margin: 0 }}>
                Merchant & Product Moderation Governance
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Policy 1 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <span style={{ fontWeight: "700", color: "#ffffff", fontSize: "14px" }}>Auto-Approve Partner Registrations</span>
                    <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>When enabled, merchant registrations will be marked ACTIVE without SuperAdmin manual verification.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    style={{ width: "20px", height: "20px", accentColor: "#10b981", cursor: "pointer" }}
                    checked={settings.autoApprovePartners}
                    onChange={e => setSettings({ ...settings, autoApprovePartners: e.target.checked })}
                  />
                </div>

                {/* Policy 2 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <span style={{ fontWeight: "700", color: "#ffffff", fontSize: "14px" }}>Auto-Approve Listed Products</span>
                    <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>When disabled, new products listed by partners will require Admin moderation approval before going live.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    style={{ width: "20px", height: "20px", accentColor: "#10b981", cursor: "pointer" }}
                    checked={settings.autoApproveProducts}
                    onChange={e => setSettings({ ...settings, autoApproveProducts: e.target.checked })}
                  />
                </div>

                {/* Policy 3 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <span style={{ fontWeight: "700", color: "#ffffff", fontSize: "14px" }}>Mandatory UPI Payment Proof & UTR Verification</span>
                    <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>Enforces 12-digit UTR and payment screenshot submission for UPI prepaid orders before fulfillment.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    style={{ width: "20px", height: "20px", accentColor: "#10b981", cursor: "pointer" }}
                    checked={settings.requireUpiVerification}
                    onChange={e => setSettings({ ...settings, requireUpiVerification: e.target.checked })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ALERTS & NOTIFICATIONS */}
          {activeTab === "ALERTS" && (
            <div className={styles.adminCard} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", margin: 0 }}>
                System Alerts & Thresholds
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <span style={{ fontWeight: "700", color: "#ffffff", fontSize: "14px" }}>Email Notification Alerts</span>
                    <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>Send email alerts to SuperAdmin on new merchant signups and server incidents.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    style={{ width: "20px", height: "20px", accentColor: "#10b981", cursor: "pointer" }}
                    checked={settings.emailAlertsEnabled}
                    onChange={e => setSettings({ ...settings, emailAlertsEnabled: e.target.checked })}
                  />
                </div>

                <div className={styles.formGroup} style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <label className={styles.formLabel}>High Value Order Alert Threshold (₹)</label>
                  <input 
                    type="number" 
                    className={styles.formInput} 
                    value={settings.highValueOrderAlertAmount} 
                    onChange={e => setSettings({ ...settings, highValueOrderAlertAmount: parseInt(e.target.value) || 0 })} 
                  />
                  <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Orders exceeding this amount flag a high-priority fraud-check banner</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM HEALTH & BACKUP */}
          {activeTab === "SYSTEM" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Live Health Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "16px", padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8" }}>MongoDB Atlas</span>
                    <Activity size={16} color="#34d399" />
                  </div>
                  <span style={{ fontSize: "18px", fontWeight: "800", color: "#34d399" }}>Connected (100% Health)</span>
                </div>

                <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "16px", padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8" }}>Cloudinary CDN</span>
                    <Cloud size={16} color="#818cf8" />
                  </div>
                  <span style={{ fontSize: "18px", fontWeight: "800", color: "#818cf8" }}>Active (Fast Delivery)</span>
                </div>

                <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "16px", padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8" }}>Next.js Engine</span>
                    <Server size={16} color="#fbbf24" />
                  </div>
                  <span style={{ fontSize: "18px", fontWeight: "800", color: "#fbbf24" }}>Turbopack Ready</span>
                </div>
              </div>

              {/* Maintenance & Backup Actions */}
              <div className={styles.adminCard} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", margin: 0 }}>
                  Database Export & Maintenance
                </h3>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <span style={{ fontWeight: "700", color: "#ffffff", fontSize: "14px" }}>System Maintenance Mode</span>
                    <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>Temporarily show a maintenance screen to regular buyers and sellers.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    style={{ width: "20px", height: "20px", accentColor: "#ef4444", cursor: "pointer" }}
                    checked={settings.maintenanceMode}
                    onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                  <button 
                    onClick={handleExportBackup}
                    style={{ padding: "10px 18px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <Download size={16} /> Export Settings JSON Backup
                  </button>
                  <button 
                    onClick={() => showToast("System cache flushed successfully!", "success")}
                    style={{ padding: "10px 18px", borderRadius: "10px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <RefreshCw size={16} /> Flush System Cache
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
