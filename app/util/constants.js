/**
 * Constants & Enums for KrackDeal Admin Portal
 */

// ==========================================
// 1. Partner Verification Statuses
// ==========================================
export const PARTNER_STATUSES = {
  ACTIVE: "ACTIVE",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED"
};

// ==========================================
// 2. Category Display Statuses
// ==========================================
export const CATEGORY_STATUSES = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE"
};

// ==========================================
// 3. Order Status Badges & Styling
// ==========================================
export const ORDER_STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    bg: "#fef3c7",
    color: "#d97706",
    border: "#fde68a"
  },
  ACCEPTED: {
    label: "Accepted",
    bg: "#e0e7ff",
    color: "#4338ca",
    border: "#c7d2fe"
  },
  PROCESSING: {
    label: "Processing",
    bg: "#e0f2fe",
    color: "#0369a1",
    border: "#bae6fd"
  },
  SHIPPED: {
    label: "Out for Delivery",
    bg: "#dbeafe",
    color: "#1d4ed8",
    border: "#bfdbfe"
  },
  DELIVERED: {
    label: "Delivered",
    bg: "#dcfce7",
    color: "#15803d",
    border: "#bbf7d0"
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "#fee2e2",
    color: "#b91c1c",
    border: "#fecaca"
  }
};
