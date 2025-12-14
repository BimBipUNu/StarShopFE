// import type { ProductType } from "../types/productType";
// import axiosConfig from "./axiosConfig";

// export async function getAllProducts() {
//   try {
//     const response = await axiosConfig.get(`/products`);
//     // AxiosConfig interceptor đã unwrap response.data rồi, nên response đã là data
//     return response;
//   } catch (err) {
//     console.error("Error fetching products:", err);
//     throw err; // Throw lại để Redux thunk có thể catch
//   }
// }

// export async function getProductById(id: number) {
//   try {
//     const response = await axiosConfig.get(`/products/${id}`);
//     return response;
//   } catch (err) {
//     console.log(err);
//   }
// }

// export async function deleteProductById(id: number) {
//   try {
//     await axiosConfig.delete(`/products/${id}`);
//     return id;
//   } catch (err) {
//     console.log(err);
//   }
// }

// export async function updateProduct(data: ProductType) {
//   try {
//     const response = await axiosConfig.put(`/products/${data.id}`, data);
//     return response.data;
//   } catch (err) {
//     console.log(err);
//     throw err;
//   }
// }

// export async function addNewProducts(data: ProductType) {
//   try {
//     const response = await axiosConfig.post(`/products`, { ...data });
//     return response.data;
//   } catch (error) {
//     console.error("Error:", error);
//     throw error;
//   }
// }

// const productAPI = {
//   getAllData: getAllProducts,
//   getDataById: getProductById,
//   post: addNewProducts,
//   put: updateProduct,
//   delete: deleteProductById,
// };

// export default productAPI;

import type { ProductType } from "../types/productType";
import axiosConfig from "./axiosConfig";

// Lấy tất cả sản phẩm
export async function getAllProducts() {
  try {
    const response = await axiosConfig.get(`/products`);
    return response;
  } catch (err) {
    console.error("Error fetching products:", err);
    throw err;
  }
}

// Lấy chi tiết
export async function getProductById(id: number | string) {
  try {
    const response = await axiosConfig.get(`/products/${id}`);
    return response;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// Xóa sản phẩm
export async function deleteProductById(id: number | string) {
  try {
    await axiosConfig.delete(`/products/${id}`);
    return id;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// Cập nhật sản phẩm
export async function updateProduct(data: ProductType) {
  try {
    // Lưu ý: data.id nên được gửi đi hoặc nằm trong URL tùy backend
    const response = await axiosConfig.put(`/products/${data.id}`, data);
    return response; // Trả về object sản phẩm đã update từ server
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// Thêm mới sản phẩm
export async function addNewProducts(data: Omit<ProductType, "id">) {
  try {
    const response = await axiosConfig.post(`/products`, data);
    return response; // Trả về object sản phẩm vừa tạo
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

const productAPI = {
  getAllData: getAllProducts,
  getDataById: getProductById,
  post: addNewProducts,
  put: updateProduct,
  delete: deleteProductById,
};

export default productAPI;
