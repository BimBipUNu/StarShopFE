// src/api/categories.ts
import type { CategoryType } from "../types/categoryType"; // Giả sử bạn có file type này
import axiosConfig from "./axiosConfig";

export async function getAllCategories() {
  try {
    const response = await axiosConfig.get(`/categories`);
    // AxiosConfig interceptor đã unwrap response.data rồi, nên response đã là data
    return response;
  } catch (err) {
    console.error("Error fetching categories:", err);
    throw err; // Throw lại để Redux thunk có thể catch
  }
}

export async function getCategoryById(data: { id: number }) {
  try {
    const response = await axiosConfig.get(`/categories/${data.id}`);
    return response;
  } catch (err) {
    console.log(err);
  }
}

export async function addNewCategory(data: CategoryType) {
  try {
    const response = await axiosConfig.post(`/categories`, data);
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function updateCategory(data: CategoryType) {
  try {
    const response = await axiosConfig.put(`/categories/${data.id}`, data);
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function deleteCategory(data: { id: number }) {
  try {
    await axiosConfig.delete(`/categories/${data.id}`);
    return data.id;
  } catch (err) {
    console.log(err);
  }
}

const categoryAPI = {
  getAll: getAllCategories,
  getById: getCategoryById,
  post: addNewCategory,
  put: updateCategory,
  delete: deleteCategory,
};

export default categoryAPI;
