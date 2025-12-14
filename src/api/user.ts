// src/api/user.ts
import type { UserType } from "../types/userTypes";
import axiosConfig from "./axiosConfig";

// Lấy danh sách tất cả user (Admin)
export async function getAllUsers() {
  try {
    const response = await axiosConfig.get(`/users`);
    return response;
  } catch (err) {
    console.log(err);
  }
}

// // Lấy thông tin User hiện tại (Profile)
// export async function getUserProfile() {
//   try {
//     const response = await axiosConfig.get(`/users/profile`);
//     return response;
//   } catch (err) {
//     console.log(err);
//   }
// }

export async function getUserById(data: { id: number }) {
  try {
    const response = await axiosConfig.get(`/users/${data.id}`);
    return response.data;
  } catch (err) {
    console.log(err);
  }
}

export async function updateUser(data: UserType) {
  try {
    const response = await axiosConfig.put(`/users/${data.id}`, data);
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// Xóa User (Admin)
export async function deleteUser(id: number) {
  try {
    await axiosConfig.delete(`/users/${id}`);
    return id;
  } catch (err) {
    console.log(err);
  }
}

const userAPI = {
  getAll: getAllUsers,
  // getProfile: getUserProfile,
  getById: getUserById,
  put: updateUser,
  delete: deleteUser,
};

export default userAPI;
