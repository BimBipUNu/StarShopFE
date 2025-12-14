import { useState, useEffect } from "react";
import type { ProductType } from "../../../types/productType";
import type { CategoryType } from "../../../types/categoryType";
import Api from "../../../api";

interface ProductFormModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (product: Omit<ProductType, "id"> | ProductType) => void;
  product: ProductType | null;
  isSubmitting: boolean;
}

const initialFormData: Omit<ProductType, "id"> = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  image: "",
  categoryId: "",
  featured: false,
};

function ProductFormModal({
  show,
  onHide,
  onSubmit,
  product,
  isSubmitting,
}: ProductFormModalProps) {
  // State form
  const [formData, setFormData] = useState<
    Omit<ProductType, "id"> | ProductType
  >(initialFormData);
  const [categories, setCategories] = useState<CategoryType[]>([]);

  // Effect: Reset form và load danh mục khi Modal mở
  useEffect(() => {
    // 1. Khai báo hàm loadCategories bên trong useEffect để tránh lỗi hoisting
    const loadCategories = async () => {
      try {
        const cats = await Api.category.getAll();
        // Xử lý an toàn nếu API trả về mảng hoặc object chứa data
        const data = Array.isArray(cats) ? cats : cats.data || [];
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };

    if (show) {
      // 2. Logic reset form data
      if (product) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData(product);
      } else {
        setFormData(initialFormData);
      }

      // 3. Gọi hàm load data
      loadCategories();
    }
  }, [show, product]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData((prev) => {
      // Xử lý đặc biệt cho checkbox
      if (type === "checkbox") {
        return {
          ...prev,
          [name]: (e.target as HTMLInputElement).checked,
        };
      }

      // Xử lý cho số và text thông thường
      return {
        ...prev,
        [name]: name === "price" || name === "stock" ? Number(value) : value,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!show) return null;

  return (
    // Overlay (Backdrop)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 transition-opacity"
      onClick={onHide}
    >
      {/* Modal Content */}
      <div
        className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">
            {product ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
          </h3>
          <button
            onClick={onHide}
            disabled={isSubmitting}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto"
        >
          {/* 1. Tên sản phẩm */}
          <div>
            <label
              htmlFor="productName"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="productName"
              name="name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên sản phẩm..."
              required
            />
          </div>

          {/* 2. Mô tả */}
          <div>
            <label
              htmlFor="productDescription"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Mô tả
            </label>
            <textarea
              id="productDescription"
              name="description"
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả ngắn về sản phẩm..."
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 3. Giá bán */}
            <div>
              <label
                htmlFor="productPrice"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                Giá bán (VND) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="productPrice"
                name="price"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.price}
                onChange={handleChange}
                min={0}
                required
              />
            </div>

            {/* 4. Số lượng kho */}
            <div>
              <label
                htmlFor="productStock"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                Số lượng kho <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="productStock"
                name="stock"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.stock}
                onChange={handleChange}
                min={0}
                required
              />
            </div>
          </div>

          {/* 5. Danh mục */}
          <div>
            <label
              htmlFor="productCategory"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              id="productCategory"
              name="categoryId"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">Chọn danh mục...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Link hình ảnh & Preview */}
          <div>
            <label
              htmlFor="productImage"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Link hình ảnh <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="productImage"
              name="image"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://..."
              required
            />
            {formData.image && (
              <div className="mt-2 h-20 w-20 overflow-hidden rounded-lg border border-slate-200">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/150?text=Error";
                  }}
                />
              </div>
            )}
          </div>

          {/* 7. Featured (Sản phẩm nổi bật) */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="productFeatured"
              name="featured"
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={formData.featured}
              onChange={handleChange}
            />
            <label
              htmlFor="productFeatured"
              className="text-sm font-medium text-slate-700"
            >
              Đặt làm sản phẩm nổi bật
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={onHide}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition disabled:bg-blue-400"
            >
              {isSubmitting && <i className="fa-solid fa-spinner fa-spin"></i>}
              {product ? "Lưu thay đổi" : "Tạo sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductFormModal;
