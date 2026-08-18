/**
 * Centralized Environment Configuration for KrackDeal Admin Portal
 */
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PROD: process.env.NODE_ENV === "production",
  PORT: process.env.PORT || 3001,
  
  // Cross-App Portal URLs
  ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001",
  STORE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  PARTNER_URL: process.env.NEXT_PUBLIC_PARTNER_URL || "http://localhost:3002"
};
