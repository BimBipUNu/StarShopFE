import axios from "axios";

const axiosConfig = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Tự động gắn Token vào mỗi request nếu có (cho các route cần quyền user/admin)
axiosConfig.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token"); // Lấy token từ localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Xử lý lỗi chung (VD: Token hết hạn thì logout)
axiosConfig.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // Xử lý lỗi global ở đây nếu cần
    throw error;
  }
);

export default axiosConfig;
