import axiosConfig from "./axiosConfig";

export async function register(data: {
  name: string;
  email: string;
  password: string;
}) {
  return axiosConfig.post("/auth/register", data);
}
export async function login(data: { email: string; password: string }) {
  return await axiosConfig.post("/auth/login", data);
}
export async function logout() {
  return await axiosConfig.post("/auth/logout");
}

const authAPI = {
  register,
  login,
  logout,
};
export default authAPI;
