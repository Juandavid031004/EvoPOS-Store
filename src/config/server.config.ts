export const SERVER_CONFIG = {
  IP: import.meta.env.VITE_SERVER_IP || 'localhost',
  PORT: import.meta.env.VITE_SERVER_PORT || 5173,
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5173/api',
  ENVIRONMENT: import.meta.env.MODE || 'development'
};