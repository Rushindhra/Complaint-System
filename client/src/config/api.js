const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_DBURL ||
  'https://complaint-system-v65c.onrender.com';

export const API_BASE_URL = apiBaseUrl.replace(/\/$/, '');
