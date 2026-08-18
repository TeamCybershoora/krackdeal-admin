"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Ticket,
  TrendingUp,
  Percent,
  Zap,
  ShoppingBag,
  Store,
  Grid,
  ShieldAlert,
  Percent as PercentIcon,
  Flame,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowUpRight,
  Calendar,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";
import { formatCurrency, formatCompactNumber, formatDate } from "@/app/util/formatters";
import styles from "./admin.module.css";

// SVG Line Chart Component for Monthly Registrations
function SVGLineChart({ data, width = 500, height = 200 }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.value || 1)) || 1;
  const padding = 25;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 3;
  
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((d.value || 0) / maxVal) * chartHeight;
    return { x, y };
  });

  const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding * 2} L ${points[0].x} ${height - padding * 2} Z`;

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--primary-light)" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0"/>
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Dotted Grid lines */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.02)" strokeWidth={1} strokeDasharray="3 3" />
        <line x1={padding} y1={padding + chartHeight / 2} x2={width - padding} y2={padding + chartHeight / 2} stroke="rgba(255,255,255,0.02)" strokeWidth={1} strokeDasharray="3 3" />
        <line x1={padding} y1={height - padding * 2} x2={width - padding} y2={height - padding * 2} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
        
        {/* Gradient fill */}
        <path d={areaD} fill="url(#lineGrad)" />
        
        {/* Curve Path */}
        <path d={pathD} fill="none" stroke="url(#purpleGrad)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
        
        {/* Dots */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r={6} fill="var(--primary)" opacity={0.12} />
            <circle cx={p.x} cy={p.y} r={3} fill="#ffffff" stroke="var(--primary)" strokeWidth={1.5} />
          </g>
        ))}

        {/* X Axis Labels */}
        {data.map((d, idx) => {
          const x = padding + (idx / (data.length - 1)) * chartWidth;
          return (
            <text 
              key={idx}
              x={x}
              y={height - 8}
              textAnchor="middle"
              fill="var(--text-muted)"
              style={{ fontSize: "10px", fontWeight: "600", fontFamily: "var(--font-primary)" }}
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// Sparkline Spark Spark curve for horizontal cards
function Sparkline({ points = [10, 15, 8, 12, 20, 18, 25], color = "#46D39A" }) {
  const width = 60;
  const height = 18;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const pathD = "M " + points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * height;
    return `${x} ${y}`;
  }).join(" L ");
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState("1M");
  const router = useRouter();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/API/admin/dashboard");
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
      }
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "60px" }}>
        {/* Skeleton Header */}
        <div style={{ height: "40px", width: "240px", background: "var(--bg-secondary)", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
        
        {/* Skeleton Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          {[...Array(8)].map((_, idx) => (
            <div key={idx} style={{ height: "96px", background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "16px", animation: "pulse 1.5s infinite" }} />
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div style={{ height: "240px", background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "20px", animation: "pulse 1.5s infinite" }} />
          <div style={{ height: "240px", background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "20px", animation: "pulse 1.5s infinite" }} />
        </div>
      </div>
    );
  }

  const { stats, charts } = data;

  const registrationChartData = charts.monthlyRegistration.map(item => ({
    label: item.month,
    value: item.users + item.partners
  }));

  const tabList = ["1D", "7D", "1M", "YTD", "1Y", "5Y", "All"];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className={styles.dashboardGrid} 
      style={{ paddingBottom: "60px" }}
    >
      {/* Title Row greeting */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>Hi <span style={{ textTransform: "capitalize" }}>{user?.name || "admin"}</span></h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Welcome back, here's what's happening today.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={fetchDashboardData}
            className={styles.btnIcon}
            style={{ width: "38px", height: "38px", borderRadius: "10px" }}
            title="Reload Metrics"
          >
            <RefreshCw size={14} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/admin/settings")}
            className={styles.btnPrimary}
            style={{ padding: "8px 18px", fontSize: "13px", borderRadius: "10px" }}
          >
            Take Action +
          </motion.button>
        </div>
      </div>

      {/* Redesigned 2-Column Fintech Layout */}
      <div className={styles.dashboardLayoutContainer}>
        
        {/* Left Column (Main balance graph & sub cards) */}
        <div className={styles.dashboardLeftColumn}>
          
          {/* Main Card (Line chart and selectors) */}
          <div className={styles.glassCard} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Balance and range header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <span className={styles.statLabel} style={{ textTransform: "uppercase", letterSpacing: "1px", fontSize: "11px" }}>Total Platform Revenue</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                  <h2 style={{ fontSize: "32px", fontWeight: "800", letterSpacing: "-1px" }}>
                    {showBalance ? `₹${stats.revenue.toLocaleString()}` : "••••••••"}
                  </h2>
                  <button onClick={() => setShowBalance(!showBalance)} style={{ color: "var(--text-muted)", background: "none", display: "flex", alignItems: "center" }}>
                    {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className={styles.statTrend} style={{ marginTop: "4px" }}>
                  <span className={styles.trendUp}>+₹{(stats.revenue * 0.12).toFixed(2)} (+12.4%)</span>
                  <span style={{ color: "var(--text-muted)" }}>1d</span>
                </div>
              </div>

              {/* Selector tabs */}
              <div className={styles.tabsGroup}>
                {tabList.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTabBtn : ""}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Large Investment Chart Equivalent */}
            <div style={{ background: "rgba(0, 0, 0, 0.15)", padding: "20px", borderRadius: "16px", border: "1px solid var(--border-light)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>₹{stats.revenue.toLocaleString()}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "8px" }}>SaaS Subscriptions</span>
                </div>
                <span style={{ fontSize: "11px", color: "var(--primary-light)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Timeline</span>
              </div>
              <SVGLineChart data={registrationChartData} />
            </div>

            {/* Split cards matching Checking / Crypto Lending */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {/* Card 1: Users */}
              <div style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-light)", borderRadius: "16px", padding: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>Registered Users</span>
                  <h4 style={{ fontSize: "20px", fontWeight: "800", marginTop: "4px" }}>{stats.totalUsers.toLocaleString()}</h4>
                  <span style={{ fontSize: "11px", color: "var(--accent-green)", fontWeight: "600" }}>Active Customer Profiles</span>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/admin/users")}
                  className={styles.depositButton}
                >
                  Manage
                </motion.button>
              </div>

              {/* Card 2: Partners */}
              <div style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-light)", borderRadius: "16px", padding: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>Merchant Partners</span>
                  <h4 style={{ fontSize: "20px", fontWeight: "800", marginTop: "4px" }}>{stats.totalPartners.toLocaleString()}</h4>
                  <span style={{ fontSize: "11px", color: "var(--accent-green)", fontWeight: "600" }}>Approved Stores</span>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/admin/partners")}
                  className={styles.depositButton}
                >
                  Verify
                </motion.button>
              </div>
            </div>
          </div>

          {/* Today's Platform Activity (Today's Market list style) */}
          <div className={styles.glassCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 className={styles.cardTitle} style={{ fontSize: "16px" }}>Today's Platform Registrations</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" }}>Newly registered merchant stores and buyers.</p>
              </div>
              <span onClick={() => router.push("/admin/partners")} style={{ cursor: "pointer", color: "var(--primary-light)", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "2px" }}>
                View All <ChevronRight size={14} />
              </span>
            </div>

            {/* Horizontal visual items */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
              {charts.latestPartners.slice(0, 4).map((partner, idx) => {
                const sparks = [
                  [10, 15, 8, 12, 20, 18, 25],
                  [15, 10, 18, 12, 14, 25, 28],
                  [8, 14, 10, 15, 12, 22, 20],
                  [20, 18, 22, 14, 25, 20, 30]
                ];
                return (
                  <div 
                    key={partner.id}
                    style={{ 
                      background: "rgba(255,255,255,0.01)", 
                      border: "1px solid var(--border-light)", 
                      borderRadius: "16px", 
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--primary-glow)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "12px" }}>
                          {partner.storeName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span style={{ display: "block", fontSize: "12px", fontWeight: "700" }}>{partner.storeName}</span>
                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{partner.ownerName}</span>
                        </div>
                      </div>
                      <ArrowUpRight size={14} style={{ color: "var(--accent-green)" }} />
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
                      <Sparkline points={sparks[idx % sparks.length]} color={idx % 2 === 0 ? "var(--accent-green)" : "var(--primary-light)"} />
                      <span style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: "600" }}>New Store</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (Verification Alerts, Category rewards, and platform activity) */}
        <div className={styles.dashboardRightColumn}>
          
          {/* Alerts Banner */}
          <div 
            style={{ 
              background: "linear-gradient(135deg, var(--bg-secondary) 0%, rgba(155, 107, 255, 0.05) 100%)", 
              border: "1px solid rgba(155, 107, 255, 0.2)",
              borderRadius: "20px", 
              padding: "18px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <AlertCircle size={16} style={{ color: "var(--primary)" }} />
              <div>
                <span style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>Pending Approvals</span>
                <span style={{ fontSize: "13px", fontWeight: "700" }}>Verify Store Accounts</span>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/admin/partners")}
              className={styles.btnPrimary}
              style={{ padding: "6px 14px", fontSize: "11px", borderRadius: "8px" }}
            >
              Verify Now
            </motion.button>
          </div>

          {/* Category Distribution Doughnut visual equivalent */}
          <div className={styles.glassCard} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className={styles.cardTitle} style={{ fontSize: "16px" }}>Category Distribution</h3>
              <select className={styles.roleSelect} style={{ padding: "3px 8px", fontSize: "11px" }}>
                <option>Month</option>
              </select>
            </div>

            {/* Circular Ring progress */}
            <div className={styles.visualRingContainer}>
              <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="10" />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="50" 
                  fill="none" 
                  stroke="var(--primary)" 
                  strokeWidth="10" 
                  strokeDasharray="314"
                  strokeDashoffset="78" // ~75% ratio
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 0 4px var(--primary-glow))" }}
                />
              </svg>
              <div className={styles.visualRingCenter}>
                <span style={{ fontSize: "20px", fontWeight: "800" }}>{stats.totalDeals}</span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Total Deals</span>
              </div>
            </div>

            {/* Category legends */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {charts.categoryDistribution.slice(0, 4).map((cat, idx) => {
                const colors = ["var(--primary)", "var(--primary-light)", "var(--accent-green)", "var(--accent-orange)"];
                return (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: colors[idx % colors.length] }} />
                      <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>{cat.name}</span>
                    </div>
                    <span style={{ fontWeight: "700" }}>{cat.value} deals</span>
                  </div>
                );
              })}
            </div>

            <motion.button
              whileHover={{ x: 3 }}
              onClick={() => router.push("/admin/category")}
              style={{ width: "100%", border: "1px solid var(--border-light)", background: "rgba(255,255,255,0.01)", padding: "10px", borderRadius: "10px", fontSize: "12px", fontWeight: "700", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}
            >
              Manage Categories <ChevronRight size={14} />
            </motion.button>
          </div>

          {/* Upcoming tasks / Platform activity overview (resembling Upcoming Bills) */}
          <div className={styles.glassCard}>
            <div style={{ marginBottom: "16px" }}>
              <h3 className={styles.cardTitle} style={{ fontSize: "16px" }}>Platform Activity Summary</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" }}>Status overview of active and redeemed vouchers.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Item 1 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-light)", borderRadius: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(70, 211, 154, 0.08)", color: "var(--accent-green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Zap size={14} />
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: "12px", fontWeight: "700" }}>Active Coupons</span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Live listed items</span>
                  </div>
                </div>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--accent-green)" }}>{stats.activeDeals}</span>
              </div>

              {/* Item 2 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-light)", borderRadius: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Calendar size={14} />
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: "12px", fontWeight: "700" }}>Expired Coupons</span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Ended listings</span>
                  </div>
                </div>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-secondary)" }}>{stats.expiredDeals}</span>
              </div>

              {/* Item 3 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-light)", borderRadius: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--primary-glow)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Ticket size={14} />
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: "12px", fontWeight: "700" }}>Vouchers Claimed</span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Redeemed coupon codes</span>
                  </div>
                </div>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--primary)" }}>{stats.couponsRedeemed}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
