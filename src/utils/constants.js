// API base URL — loaded from environment variable
// Set EXPO_PUBLIC_API_BASE_URL in your .env file
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:8080'

// Secure storage keys — centralized to avoid typos across files
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
}

// Delivery order status values (must match backend DeliveryStatus enum)
export const DELIVERY_STATUS = {
  ASSIGNED: 'ASSIGNED',
  ACCEPTED: 'ACCEPTED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
}

// Polling interval for order refresh (milliseconds)
export const POLLING_INTERVAL_MS = 30000
