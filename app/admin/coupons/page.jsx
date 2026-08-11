"use client";

import styles from "../admin.module.css";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [expiry, setExpiry] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Fetch coupons from DB
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setMessage({ text: "", type: "" });
      const res = await fetch("/API/admin/coupons");
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
      } else {
        setMessage({ text: data.message || "Failed to load coupons.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Network error. Failed to load coupons.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Create new coupon in DB
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/API/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          discount,
          minPurchase,
          expiry,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Prepends newly created coupon to state list
        setCoupons([data.coupon, ...coupons]);
        setCode("");
        setDiscount("");
        setMinPurchase("");
        setExpiry("");
        setShowForm(false);
        setMessage({ text: data.message || "Promo code saved successfully!", type: "success" });
      } else {
        setMessage({ text: data.message || "Failed to save promo code.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Network error. Failed to save promo code.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Delete coupon from DB
  const handleDelete = async (id) => {
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch(`/API/admin/coupons?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setCoupons(coupons.filter((c) => (c._id || c.id) !== id));
        setMessage({ text: data.message || "Promo code deleted successfully!", type: "success" });
      } else {
        setMessage({ text: data.message || "Failed to delete promo code.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Network error. Failed to delete promo code.", type: "error" });
    }
  };

  return (
    <div className={styles.dashboardGrid}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800" }}>Voucher Codes</h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
            Generate promo codes, edit min purchases, and set expiry constraints.
          </p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
          <Plus size={16} style={{ marginRight: "8px", verticalAlign: "middle" }} />
          Create Code
        </button>
      </div>

      {/* Message Notifications Banner */}
      {message.text && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "12px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: "500",
            backgroundColor: message.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${message.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            color: message.type === "success" ? "#34d399" : "#f87171",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage({ text: "", type: "" })}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "18px",
              fontWeight: "bold",
              padding: "0 4px",
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>
      )}

      {showForm && (
        <div className={styles.glassCard} style={{ maxWidth: "500px", marginTop: "0", marginBottom: "30px" }}>
          <h3 className={styles.cardTitle} style={{ marginBottom: "20px" }}>
            Create Promo Code
          </h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Promo Code (Uppercase)</label>
              <input
                type="text"
                className={styles.formInput}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. KRACK50"
                disabled={saving}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Discount value</label>
                <input
                  type="text"
                  className={styles.formInput}
                  required
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="e.g. 50% Off or ₹100 Off"
                  disabled={saving}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Min Purchase</label>
                <input
                  type="text"
                  className={styles.formInput}
                  required
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(e.target.value)}
                  placeholder="e.g. ₹499"
                  disabled={saving}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Expiry Date</label>
              <input
                type="text"
                className={styles.formInput}
                required
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="e.g. 31 Dec 2026"
                disabled={saving}
              />
            </div>

            <button type="submit" className={styles.btnPrimary} style={{ width: "100%", marginTop: "10px" }} disabled={saving}>
              {saving ? "Saving Promo Code..." : "Save Promo Code"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className={styles.glassCard} style={{ marginTop: "0" }}>
          <div className={styles.adminTableWrapper}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Purchase</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td><div className={styles.skeletonLine} style={{ width: "90px", height: "18px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "80px", height: "14px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "60px", height: "14px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "100px", height: "14px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "60px", height: "20px", borderRadius: "99px" }} /></td>
                    <td style={{ textAlign: "right" }}><div className={styles.skeletonLine} style={{ width: "30px", height: "30px", borderRadius: "8px", marginLeft: "auto" }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={styles.glassCard} style={{ marginTop: "0" }}>
          <div className={styles.adminTableWrapper}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Purchase</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0" }}>
                      No coupon codes found. Click "Create Code" to add one.
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon._id || coupon.id}>
                      <td>
                        <span
                          style={{
                            fontWeight: "800",
                            color: "#fbbf24",
                            background: "rgba(250, 204, 21, 0.08)",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            border: "1px dashed rgba(250, 204, 21, 0.2)",
                          }}
                        >
                          {coupon.code}
                        </span>
                      </td>
                      <td style={{ fontWeight: "700" }}>{coupon.discount}</td>
                      <td>{coupon.minPurchase}</td>
                      <td>{coupon.expiry}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${coupon.status === "Active" ? styles.statusActive : styles.statusInactive
                            }`}
                        >
                          {coupon.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button className={styles.btnIcon} onClick={() => handleDelete(coupon._id || coupon.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
