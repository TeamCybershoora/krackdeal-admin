"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, Eye, AlertCircle, ShoppingBag, Search, Filter } from "lucide-react";

export default function AdminProductModeration() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("PENDING_APPROVAL");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionMessage, setActionMessage] = useState({ text: "", type: "" });
    const [submittingAction, setSubmittingAction] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [filterStatus]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/API/admin/moderation/products?status=${filterStatus}`);
            const data = await res.json();
            if (data.success) {
                setProducts(data.products || []);
            }
        } catch (err) {
            console.error("Failed to fetch products for moderation:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleModerate = async (productId, action) => {
        setSubmittingAction(true);
        setActionMessage({ text: "", type: "" });
        try {
            const res = await fetch("/API/admin/moderation/products", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, action, rejectionReason })
            });
            const data = await res.json();
            if (data.success) {
                setActionMessage({ text: data.message, type: "success" });
                setSelectedProduct(null);
                setRejectionReason("");
                fetchProducts();
            } else {
                throw new Error(data.message || "Action failed");
            }
        } catch (err) {
            setActionMessage({ text: err.message, type: "error" });
        } finally {
            setSubmittingAction(false);
        }
    };

    return (
        <div style={{ padding: "32px", color: "#fff", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "26px", fontWeight: "800", margin: 0 }}>Product Catalog Management</h1>
                    <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>View and inspect multi-vendor product listings across all categories.</p>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: "flex", gap: "8px", background: "#2E2621", padding: "4px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {["PENDING_APPROVAL", "APPROVED", "REJECTED", "ALL"].map((st) => (
                        <button
                            key={st}
                            onClick={() => setFilterStatus(st)}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                border: "none",
                                background: filterStatus === st ? "var(--primary)" : "transparent",
                                color: filterStatus === st ? "#fff" : "#94a3b8",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer"
                             }}
                        >
                            {st.replace("_", " ")}
                        </button>
                    ))}
                </div>
            </div>

            {actionMessage.text && (
                <div style={{ padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", background: actionMessage.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${actionMessage.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, color: actionMessage.type === "success" ? "#34d399" : "#f87171", fontSize: "14px" }}>
                    {actionMessage.text}
                </div>
            )}

            {/* Products Table / Skeleton */}
            {loading ? (
                <div style={{ background: "#26201C", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                        <thead>
                            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "12px", textTransform: "uppercase" }}>
                                <th style={{ padding: "16px 20px" }}>Product</th>
                                <th style={{ padding: "16px 20px" }}>Merchant Store</th>
                                <th style={{ padding: "16px 20px" }}>Category</th>
                                <th style={{ padding: "16px 20px" }}>Price (₹)</th>
                                <th style={{ padding: "16px 20px" }}>Status</th>
                                <th style={{ padding: "16px 20px", textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <td style={{ padding: "16px 20px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <div className={styles.skeletonLine} style={{ width: "44px", height: "44px", borderRadius: "8px" }} />
                                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                <div className={styles.skeletonLine} style={{ width: "140px", height: "16px" }} />
                                                <div className={styles.skeletonLine} style={{ width: "80px", height: "12px" }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px 20px" }}><div className={styles.skeletonLine} style={{ width: "120px", height: "14px" }} /></td>
                                    <td style={{ padding: "16px 20px" }}><div className={styles.skeletonLine} style={{ width: "90px", height: "14px" }} /></td>
                                    <td style={{ padding: "16px 20px" }}><div className={styles.skeletonLine} style={{ width: "60px", height: "16px" }} /></td>
                                    <td style={{ padding: "16px 20px" }}><div className={styles.skeletonLine} style={{ width: "75px", height: "22px", borderRadius: "99px" }} /></td>
                                    <td style={{ padding: "16px 20px", textAlign: "right" }}><div className={styles.skeletonLine} style={{ width: "100px", height: "32px", borderRadius: "8px", marginLeft: "auto" }} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", background: "#26201C", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", color: "#94a3b8" }}>
                    <ShoppingBag size={40} style={{ color: "var(--primary)", marginBottom: "12px" }} />
                    <p style={{ fontSize: "16px", fontWeight: "600", color: "#fff", margin: "0 0 4px 0" }}>No Products Found</p>
                    <p style={{ fontSize: "13px", margin: 0 }}>There are currently no products under "{filterStatus.replace("_", " ")}" status.</p>
                </div>
            ) : (
                <div style={{ background: "#26201C", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                        <thead>
                            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "12px", textTransform: "uppercase" }}>
                                <th style={{ padding: "16px 20px" }}>Product</th>
                                <th style={{ padding: "16px 20px" }}>Merchant Store</th>
                                <th style={{ padding: "16px 20px" }}>Category</th>
                                <th style={{ padding: "16px 20px" }}>Price (₹)</th>
                                <th style={{ padding: "16px 20px" }}>Status</th>
                                <th style={{ padding: "16px 20px", textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((prod) => (
                                <tr key={prod._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <td style={{ padding: "16px 20px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <img
                                                src={prod.images && prod.images.length > 0 ? prod.images[0].url : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100"}
                                                alt={prod.title}
                                                style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover", background: "rgba(255,255,255,0.05)" }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: "700", color: "#fff" }}>{prod.title}</div>
                                                <div style={{ fontSize: "12px", color: "#64748b" }}>SKU: {prod.sku || "N/A"}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px 20px", color: "#cbd5e1" }}>
                                        {prod.sellerId?.storeName || "Unknown Partner"}
                                    </td>
                                    <td style={{ padding: "16px 20px", color: "var(--primary-light)", fontWeight: "600" }}>
                                        {prod.category?.name || "General"}
                                    </td>
                                    <td style={{ padding: "16px 20px", fontWeight: "700", color: "#34d399" }}>
                                        ₹{prod.basePrice}
                                    </td>
                                    <td style={{ padding: "16px 20px" }}>
                                        <span style={{
                                            padding: "4px 10px",
                                            borderRadius: "99px",
                                            fontSize: "11px",
                                            fontWeight: "700",
                                            background: prod.status === "APPROVED" ? "rgba(16,185,129,0.15)" : prod.status === "REJECTED" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                                            color: prod.status === "APPROVED" ? "#34d399" : prod.status === "REJECTED" ? "#f87171" : "#fbbf24",
                                            border: `1px solid ${prod.status === "APPROVED" ? "rgba(16,185,129,0.3)" : prod.status === "REJECTED" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`
                                        }}>
                                            {prod.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                                        <button
                                            onClick={() => setSelectedProduct(prod)}
                                            style={{ padding: "8px 14px", borderRadius: "8px", background: "var(--primary)", color: "#fff", border: "none", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                        >
                                            <Eye size={14} /> Inspect Product
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Product Inspection Drawer / Modal */}
            {selectedProduct && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
                    <div style={{ background: "#26201C", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "650px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "20px", fontWeight: "800", margin: 0 }}>Product Inspection & Review</h3>
                            <button onClick={() => setSelectedProduct(null)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer" }}>&times;</button>
                        </div>

                        <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                            <img
                                src={selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images[0].url : ""}
                                alt={selectedProduct.title}
                                style={{ width: "100px", height: "100px", borderRadius: "12px", objectFit: "cover" }}
                            />
                            <div>
                                <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: "700" }}>{selectedProduct.title}</h4>
                                <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "var(--primary-light)" }}>Brand: {selectedProduct.brand || "N/A"} | Category: {selectedProduct.category?.name}</p>
                                <p style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#34d399" }}>₹{selectedProduct.basePrice} <span style={{ textDecoration: "line-through", color: "#64748b", fontSize: "12px" }}>₹{selectedProduct.compareAtPrice}</span></p>
                            </div>
                        </div>

                        {/* Specifications Map */}
                        <div style={{ marginBottom: "20px", background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <h5 style={{ margin: "0 0 10px 0", color: "var(--primary-light)", fontSize: "12px", textTransform: "uppercase" }}>Dynamic Category Specifications</h5>
                            {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 ? (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
                                    {Object.entries(selectedProduct.specifications).map(([k, v]) => (
                                        <div key={k} style={{ color: "#cbd5e1" }}>
                                            <strong style={{ color: "#94a3b8" }}>{k}:</strong> {String(v)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>No dynamic specifications attached.</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                style={{ padding: "10px 20px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
