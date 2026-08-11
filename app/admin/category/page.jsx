"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  X,
  FileText,
  AlertCircle,
  CheckCircle,
  Grid
} from "lucide-react";
import styles from "../admin.module.css";

export default function AdminCategory() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [savingCat, setSavingCat] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);

  const [catMessage, setCatMessage] = useState({ text: "", type: "" });
  const [brandMessage, setBrandMessage] = useState({ text: "", type: "" });

  // Search & Filter state for categories
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | ACTIVE | DISABLED
  const [sortBy, setSortBy] = useState("name"); // name | newest | oldest
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Category Inputs & Files
  const [catName, setCatName] = useState("");
  const [slugPreview, setSlugPreview] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catStatus, setCatStatus] = useState("ACTIVE"); // ACTIVE | DISABLED
  const [catImage, setCatImage] = useState("");
  const [catFile, setCatFile] = useState(null);
  const [catImagePreview, setCatImagePreview] = useState("");
  const [showCatForm, setShowCatForm] = useState(false);
  const [editCatId, setEditCatId] = useState(null);

  // Brand Inputs & Files
  const [brandName, setBrandName] = useState("");
  const [brandLogo, setBrandLogo] = useState("");
  const [brandFile, setBrandFile] = useState(null);
  const [brandLogoPreview, setBrandLogoPreview] = useState("");
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [editBrandId, setEditBrandId] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoadingCats(true);
      const url = `/API/admin/categories?page=${currentPage}&limit=5&search=${encodeURIComponent(searchQuery)}&status=${statusFilter}&sort=${sortBy}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
        if (data.pagination) {
          setTotalPages(data.pagination.pages || 1);
          setTotalItems(data.pagination.total || 0);
        }
      } else {
        setCatMessage({ text: data.message || "Failed to load categories.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setCatMessage({ text: "Network error. Failed to load categories.", type: "error" });
    } finally {
      setLoadingCats(false);
    }
  };

  const fetchBrands = async () => {
    try {
      setLoadingBrands(true);
      const res = await fetch("/API/admin/brands");
      const data = await res.json();
      if (data.success) {
        setBrands(data.brands || []);
      } else {
        setBrandMessage({ text: data.message || "Failed to load brands.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setBrandMessage({ text: "Network error. Failed to load brands.", type: "error" });
    } finally {
      setLoadingBrands(false);
    }
  };

  // Trigger search on filter changes
  useEffect(() => {
    fetchCategories();
  }, [currentPage, statusFilter, sortBy]);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      fetchCategories();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    fetchBrands();
  }, []);

  // Inline slug generator
  const handleNameChange = (val) => {
    setCatName(val);
    const slugified = val.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlugPreview(slugified);
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    setSavingCat(true);
    setCatMessage({ text: "", type: "" });

    try {
      let finalImageUrl = catImage;

      if (catFile) {
        const formData = new FormData();
        formData.append("file", catFile);
        formData.append("type", "categories");

        const uploadRes = await fetch("/API/admin/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (!uploadData.success) {
          throw new Error(uploadData.message || "Category image upload failed");
        }
        finalImageUrl = uploadData.url;
      }

      if (!finalImageUrl) {
        throw new Error("Category image is required");
      }

      const res = await fetch("/API/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: editCatId, 
          name: catName, 
          image: finalImageUrl,
          description: catDescription,
          isActive: catStatus === "ACTIVE"
        }),
      });
      const data = await res.json();

      if (data.success) {
        setCatMessage({ 
          text: editCatId ? "Category updated successfully!" : "Category created successfully!", 
          type: "success" 
        });
        setCatName("");
        setSlugPreview("");
        setCatDescription("");
        setCatStatus("ACTIVE");
        setCatImage("");
        setCatFile(null);
        setCatImagePreview("");
        setEditCatId(null);
        setShowCatForm(false);
        fetchCategories(); // Refresh full data with pagination counts
      } else {
        setCatMessage({ text: data.message || "Failed to save category.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setCatMessage({ text: err.message || "Network error. Failed to save category.", type: "error" });
    } finally {
      setSavingCat(false);
    }
  };

  const handleEditCat = (cat) => {
    setEditCatId(cat._id);
    setCatName(cat.name);
    setSlugPreview(cat.slug || "");
    setCatDescription(cat.description || "");
    setCatStatus(cat.isActive !== false ? "ACTIVE" : "DISABLED");
    setCatImage(cat.image || "");
    setCatImagePreview(cat.image || "");
    setCatFile(null);
    setShowCatForm(true);
  };

  const handleDeleteCat = async (id) => {
    if (confirm("Are you sure you want to delete this category? All associations will be broken.")) {
      setCatMessage({ text: "", type: "" });
      try {
        const res = await fetch(`/API/admin/categories?id=${id}`, { method: "DELETE" });
        const data = await res.json();

        if (data.success) {
          setCatMessage({ text: "Category deleted successfully!", type: "success" });
          fetchCategories();
        } else {
          setCatMessage({ text: data.message || "Failed to delete category.", type: "error" });
        }
      } catch (err) {
        console.error(err);
        setCatMessage({ text: "Network error. Failed to delete category.", type: "error" });
      }
    }
  };

  const handleToggleCatStatus = async (cat) => {
    setCatMessage({ text: "", type: "" });
    const currentIsActive = cat.isActive !== false;
    const newStatus = !currentIsActive;
    try {
      const res = await fetch("/API/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat._id, isActive: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setCategories(categories.map(c => c._id === cat._id ? { ...c, isActive: newStatus } : c));
        setCatMessage({ 
          text: `Category "${cat.name}" has been ${newStatus ? 'enabled' : 'disabled'}!`, 
          type: "success" 
        });
      } else {
        setCatMessage({ text: data.message || "Failed to update category status.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setCatMessage({ text: "Network error. Failed to update status.", type: "error" });
    }
  };

  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    setSavingBrand(true);
    setBrandMessage({ text: "", type: "" });

    try {
      let finalLogoUrl = brandLogo;

      if (brandFile) {
        const formData = new FormData();
        formData.append("file", brandFile);
        formData.append("type", "brands");

        const uploadRes = await fetch("/API/admin/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (!uploadData.success) {
          throw new Error(uploadData.message || "Brand logo upload failed");
        }
        finalLogoUrl = uploadData.url;
      }

      if (!finalLogoUrl) {
        throw new Error("Brand logo is required");
      }

      const res = await fetch("/API/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editBrandId, name: brandName, logo: finalLogoUrl }),
      });
      const data = await res.json();

      if (data.success) {
        if (editBrandId) {
          setBrands(brands.map((b) => (b._id === editBrandId ? data.brand : b)));
          setBrandMessage({ text: "Brand updated successfully!", type: "success" });
        } else {
          setBrands([data.brand, ...brands]);
          setBrandMessage({ text: "Brand created successfully!", type: "success" });
        }
        setBrandName("");
        setBrandLogo("");
        setBrandFile(null);
        setBrandLogoPreview("");
        setEditBrandId(null);
        setShowBrandForm(false);
      } else {
        setBrandMessage({ text: data.message || "Failed to save brand.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setBrandMessage({ text: err.message || "Network error. Failed to save brand.", type: "error" });
    } finally {
      setSavingBrand(false);
    }
  };

  const handleEditBrand = (brand) => {
    setEditBrandId(brand._id);
    setBrandName(brand.name);
    setBrandLogo(brand.logo || "");
    setBrandLogoPreview(brand.logo || "");
    setBrandFile(null);
    setShowBrandForm(true);
  };

  const handleDeleteBrand = async (id) => {
    if (confirm("Delete this brand?")) {
      setBrandMessage({ text: "", type: "" });
      try {
        const res = await fetch(`/API/admin/brands?id=${id}`, { method: "DELETE" });
        const data = await res.json();

        if (data.success) {
          setBrands(brands.filter((b) => b._id !== id));
          setBrandMessage({ text: "Brand deleted successfully!", type: "success" });
        } else {
          setBrandMessage({ text: data.message || "Failed to delete brand.", type: "error" });
        }
      } catch (err) {
        console.error(err);
        setBrandMessage({ text: "Network error. Failed to delete brand.", type: "error" });
      }
    }
  };

  return (
    <div className={styles.dashboardGrid}>
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800" }}>Category Management</h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>Organize deal tags, collections, and registered vendor brands.</p>
        </div>
        <button 
          className={styles.btnPrimary} 
          onClick={() => {
            setEditCatId(null);
            setCatName("");
            setSlugPreview("");
            setCatDescription("");
            setCatStatus("ACTIVE");
            setCatImage("");
            setCatImagePreview("");
            setCatFile(null);
            setCatMessage({ text: "", type: "" });
            setShowCatForm(true);
          }}
        >
          <Plus size={16} style={{ marginRight: "6px" }} />
          Create Category
        </button>
      </div>

      {catMessage.text && catMessage.type === "success" && (
        <div style={{
          padding: "12px 18px",
          borderRadius: "12px",
          marginTop: "16px",
          backgroundColor: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          color: "#34d399",
          fontSize: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle size={16} />
            <span>{catMessage.text}</span>
          </div>
          <button onClick={() => setCatMessage({ text: "", type: "" })} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: "700" }}>&times;</button>
        </div>
      )}

      {/* Main Categories Section */}
      <div className={styles.glassCard} style={{ marginTop: "24px", padding: "24px" }}>
        
        {/* Table Filters & Search */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "6px 14px", width: "100%", maxWidth: "320px" }}>
            <Search size={16} style={{ color: "#475569" }} />
            <input 
              type="text" 
              placeholder="Search by name, slug..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: "transparent", border: "none", outline: "none", color: "#ffffff", width: "100%", fontSize: "13px" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{ color: "#475569", cursor: "pointer", background: "none", border: "none" }}>&times;</button>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <select
              value={statusFilter}
              onChange={(e) => { setCurrentPage(1); setStatusFilter(e.target.value); }}
              style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)", color: "#ffffff", padding: "8px 12px", borderRadius: "10px", fontSize: "13px", outline: "none", cursor: "pointer" }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => { setCurrentPage(1); setSortBy(e.target.value); }}
              style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)", color: "#ffffff", padding: "8px 12px", borderRadius: "10px", fontSize: "13px", outline: "none", cursor: "pointer" }}
            >
              <option value="name">Sort by Name</option>
              <option value="newest">Sort by Newest</option>
              <option value="oldest">Sort by Oldest</option>
            </select>
          </div>
        </div>

        {/* Categories Table / Skeleton */}
        {loadingCats ? (
          <div className={styles.adminTableWrapper}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td><div className={styles.skeletonLine} style={{ width: "40px", height: "40px", borderRadius: "8px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "130px", height: "16px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "100px", height: "14px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "65px", height: "22px", borderRadius: "99px" }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: "80px", height: "14px" }} /></td>
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
                    <th>Image</th>
                    <th>Category Name</th>
                    <th>Slug</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", color: "#64748b", padding: "40px 0" }}>
                        No categories found matching filters.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => {
                      const isActive = cat.isActive !== false;
                      return (
                        <tr key={cat._id} style={{ opacity: isActive ? 1 : 0.6 }}>
                          <td>
                            {cat.image ? (
                              <img 
                                src={cat.image} 
                                alt={cat.name} 
                                style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.05)" }} 
                              />
                            ) : (
                              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#475569" }}>
                                <Grid size={16} />
                              </div>
                            )}
                          </td>
                          <td style={{ fontWeight: "700", color: "#ffffff" }}>{cat.name}</td>
                          <td style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--primary-light)" }}>{cat.slug || "-"}</td>
                          <td>
                            <span 
                              className={isActive ? styles.statusActive : styles.statusInactive}
                              style={{ padding: "4px 10px", borderRadius: "99px", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}
                            >
                              {isActive ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td style={{ fontSize: "12px", color: "#94a3b8" }}>
                            {new Date(cat.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "8px" }}>
                              <button 
                                type="button"
                                className={styles.btnIcon} 
                                onClick={() => handleToggleCatStatus(cat)} 
                                style={{ color: isActive ? "var(--text-secondary)" : "var(--primary-light)", borderColor: isActive ? "rgba(255,255,255,0.08)" : "rgba(155, 107, 255, 0.2)" }}
                                title={isActive ? "Disable Category" : "Enable Category"}
                              >
                                {isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              <button type="button" className={styles.btnIcon} onClick={() => handleEditCat(cat)} style={{ color: "#fbbf24", borderColor: "rgba(250, 204, 21, 0.2)" }} title="Edit Category">
                                <Edit size={14} />
                              </button>
                              <button type="button" className={styles.btnIcon} onClick={() => handleDeleteCat(cat._id)} title="Delete Category">
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px" }}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Showing <strong style={{ color: "#ffffff" }}>{categories.length}</strong> of <strong style={{ color: "#ffffff" }}>{totalItems}</strong> categories
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

      {/* Categories Edit/Creation Modal Overlay */}
      {showCatForm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "20px" }}>
          <div style={{ background: "#26201C", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", width: "100%", maxWidth: "480px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", margin: 0 }}>
                {editCatId ? "Edit Category Details" : "Create New Category"}
              </h3>
              <button 
                onClick={() => setShowCatForm(false)} 
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCatSubmit} style={{ padding: "24px" }}>
              {catMessage.text && catMessage.type === "error" && (
                <div style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                  fontSize: "13px",
                  fontWeight: "500",
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "#f87171",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <AlertCircle size={16} />
                  <span>{catMessage.text}</span>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  required
                  placeholder="e.g. Health & Beauty"
                  value={catName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  disabled={savingCat}
                />
              </div>

              <div className={styles.formGroup}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <label className={styles.formLabel} style={{ marginBottom: 0 }}>Slug (Auto Generated)</label>
                  {slugPreview && <span style={{ fontSize: "11px", color: "var(--primary-light)" }}>Ready</span>}
                </div>
                <input
                  type="text"
                  className={styles.formInput}
                  disabled
                  placeholder="health-beauty"
                  value={slugPreview}
                  style={{ background: "rgba(0,0,0,0.25)", color: "var(--primary-light)", fontFamily: "monospace", cursor: "not-allowed" }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description (Optional)</label>
                <textarea
                  className={styles.formInput}
                  placeholder="Provide a brief summary of deals listable under this tag..."
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  disabled={savingCat}
                  rows={3}
                  style={{ resize: "none" }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {editCatId ? "Replace Category Image (Optional)" : "Category Image File"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className={styles.formInput}
                  required={!editCatId}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setCatFile(file);
                      setCatImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  disabled={savingCat}
                />
                {catImagePreview && (
                  <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <img 
                      src={catImagePreview} 
                      alt="Preview" 
                      style={{ width: "48px", height: "48px", borderRadius: "6px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.08)" }} 
                    />
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Image ready for upload</span>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Initial Status</label>
                <select
                  value={catStatus}
                  onChange={(e) => setCatStatus(e.target.value)}
                  disabled={savingCat}
                  className={styles.formInput}
                  style={{ background: "#2E2621", cursor: "pointer" }}
                >
                  <option value="ACTIVE">Active (Visible to Sellers)</option>
                  <option value="DISABLED">Disabled (Hidden)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button 
                  type="button" 
                  className={styles.btnSecondary} 
                  onClick={() => setShowCatForm(false)} 
                  style={{ width: "50%" }}
                  disabled={savingCat}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary} style={{ width: "50%" }} disabled={savingCat}>
                  {savingCat ? "Saving Details..." : editCatId ? "Update Details" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brands Section (Maintained legacy compat) */}
      <div className={styles.glassCard} style={{ marginTop: "32px", padding: "24px" }}>
        <div className={styles.cardHeader} style={{ marginBottom: "20px" }}>
          <div>
            <h3 className={styles.cardTitle} style={{ fontSize: "18px" }}>Featured Partner Brands</h3>
            <p style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>Manage merchant logos showcased on customer feed.</p>
          </div>
          <button 
            className={styles.btnPrimary} 
            style={{ padding: "8px 16px", fontSize: "13px" }} 
            onClick={() => {
              setShowBrandForm(!showBrandForm);
              if (showBrandForm) {
                setBrandName("");
                setBrandLogo("");
                setBrandFile(null);
                setBrandLogoPreview("");
                setEditBrandId(null);
              }
            }}
          >
            <Plus size={14} style={{ marginRight: "4px" }} />
            {showBrandForm && editBrandId ? "Cancel Edit" : "Add Brand"}
          </button>
        </div>

        {brandMessage.text && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              marginBottom: "16px",
              fontSize: "13px",
              fontWeight: "500",
              backgroundColor: brandMessage.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${brandMessage.type === "success" ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
              color: brandMessage.type === "success" ? "#34d399" : "#f87171",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{brandMessage.text}</span>
            <button onClick={() => setBrandMessage({ text: "", type: "" })} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: "bold" }}>&times;</button>
          </div>
        )}

        {showBrandForm && (
          <form onSubmit={handleBrandSubmit} style={{ marginBottom: "24px", padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.04)", maxWidth: "480px" }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Brand Name</label>
              <input
                type="text"
                className={styles.formInput}
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                disabled={savingBrand}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                {editBrandId ? "Replace Brand Logo (Optional)" : "Brand Logo File"}
              </label>
              <input
                type="file"
                accept="image/*"
                className={styles.formInput}
                required={!editBrandId}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setBrandFile(file);
                    setBrandLogoPreview(URL.createObjectURL(file));
                  }
                }}
                disabled={savingBrand}
              />
              {brandLogoPreview && (
                <div style={{ marginTop: "10px" }}>
                  <img 
                    src={brandLogoPreview} 
                    alt="Preview" 
                    style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }} 
                  />
                </div>
              )}
            </div>
            <button type="submit" className={styles.btnPrimary} style={{ width: "100%" }} disabled={savingBrand}>
              {savingBrand ? "Saving..." : editBrandId ? "Update Brand" : "Save Brand"}
            </button>
          </form>
        )}

        {loadingBrands ? (
          <div className={styles.cardGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.brandAdminCard} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(10, 15, 25, 0.4)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div className={styles.skeletonLine} style={{ width: "36px", height: "36px", borderRadius: "8px" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div className={styles.skeletonLine} style={{ width: "100px", height: "14px" }} />
                    <div className={styles.skeletonLine} style={{ width: "60px", height: "10px" }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <div className={styles.skeletonLine} style={{ width: "24px", height: "24px", borderRadius: "6px" }} />
                  <div className={styles.skeletonLine} style={{ width: "24px", height: "24px", borderRadius: "6px" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.cardGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {brands.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#64748b", padding: "30px 0" }}>
                No brands found.
              </div>
            ) : (
              brands.map(brand => (
                <div key={brand._id} className={styles.brandAdminCard} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(10, 15, 25, 0.4)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src={brand.logo} alt={brand.name} style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover" }} />
                    <div>
                      <span style={{ fontWeight: "700", color: "#ffffff", fontSize: "13px" }}>{brand.name}</span>
                      <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>{brand.offersCount || 0} active offers</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button className={styles.btnIcon} onClick={() => handleEditBrand(brand)} style={{ color: "#fbbf24", borderColor: "rgba(250, 204, 21, 0.15)" }}>
                      <Edit size={12} />
                    </button>
                    <button className={styles.btnIcon} onClick={() => handleDeleteBrand(brand._id)} style={{ color: "#f87171", borderColor: "rgba(248, 113, 113, 0.15)" }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
