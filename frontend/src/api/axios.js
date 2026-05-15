import axios from 'axios';

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:5000/api',

  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const storedAuth = localStorage.getItem('workflow-auth');

  if (storedAuth) {
    const parsedAuth = JSON.parse(storedAuth);

    if (parsedAuth?.token) {
      config.headers.Authorization =
        `Bearer ${parsedAuth.token}`;
    }
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('workflow-auth');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;