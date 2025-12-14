/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import type { ProductType } from "../../../types/productType";
import type { CategoryType } from "../../../types/categoryType";
import Api from "../../../api";
import ProductFormModal from "./ProductFormModal";
import toast from "react-hot-toast";

// --- Types ---
type StockFilter = "all" | "instock" | "outofstock" | "low";
type SortOption = "name" | "priceAsc" | "priceDesc" | "stock";

function ProductManager() {
  // --- State ---
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  // Data Categories
  const [localCategories, setLocalCategories] = useState<CategoryType[]>([]);

  // --- Effects ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Tách hàm load data ra để tái sử dụng
  const fetchInitialData = async () => {
    try {
      // Không set loading = true ở đây để tránh nháy màn hình khi update
      // Chỉ set loading lần đầu nếu products rỗng (tùy chọn)
      if (products.length === 0) setLoading(true);

      const [productRes, categoryRes] = await Promise.all([
        Api.product.getAllData(),
        Api.category.getAll(),
      ]);

      const pData = Array.isArray(productRes)
        ? productRes
        : (productRes as any).data || [];
      setProducts(pData);

      const cData = Array.isArray(categoryRes)
        ? categoryRes
        : (categoryRes as any).data || [];
      setLocalCategories(cData);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleShowModal = (product: ProductType | null) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleHideModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmitForm = async (
    productData: ProductType | Omit<ProductType, "id">
  ) => {
    const loadingToast = toast.loading("Đang xử lý...");
    try {
      setIsSubmitting(true);
      if ("id" in productData && productData.id) {
        await Api.product.put(productData as ProductType);
        toast.success("Cập nhật thành công!", { id: loadingToast });
      } else {
        await Api.product.post(productData);
        toast.success("Thêm mới thành công!", { id: loadingToast });
      }
      await fetchInitialData();
      handleHideModal();
    } catch (error) {
      console.error("Lỗi submit form:", error);
      toast.error("Đã có lỗi xảy ra.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">Xóa sản phẩm?</p>
              <p className="mt-1 text-sm text-gray-500">
                Hành động này không thể hoàn tác.
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await Api.product.delete(id);
                toast.success("Đã xóa sản phẩm");
                await fetchInitialData();
              } catch (error) {
                console.error("Lỗi xóa:", error);
                toast.error("Không thể xóa sản phẩm.");
              }
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
          >
            Xóa
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
          >
            Hủy
          </button>
        </div>
      </div>
    ));
  };

  const getCategoryName = (categoryId: string) => {
    const category = localCategories.find(
      (c) => String(c.id) === String(categoryId)
    );
    return category ? category.name : "N/A";
  };

  // --- Logic Stats & Filter ---
  const stats = useMemo(() => {
    const inStock = products.filter((p) => (p.stock || 0) > 0).length;
    const outOfStock = products.filter((p) => (p.stock || 0) <= 0).length;
    const lowStock = products.filter(
      (p) => (p.stock || 0) > 0 && (p.stock || 0) <= 10
    ).length;
    const inventoryValue = products.reduce(
      (sum, p) => sum + (p.price || 0) * (p.stock || 0),
      0
    );
    return { inStock, outOfStock, lowStock, inventoryValue };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const name = product.name || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase().trim());
      })
      .filter((p) => {
        if (categoryFilter === "all") return true;
        return String(p.categoryId) === String(categoryFilter);
      })
      .filter((p) => {
        const stock = p.stock || 0;
        if (stockFilter === "all") return true;
        if (stockFilter === "instock") return stock > 0;
        if (stockFilter === "low") return stock > 0 && stock <= 10;
        return stock <= 0;
      })
      .sort((a, b) => {
        const stockA = a.stock || 0;
        const stockB = b.stock || 0;
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        const nameA = a.name || "";
        const nameB = b.name || "";

        switch (sortBy) {
          case "priceAsc":
            return priceA - priceB;
          case "priceDesc":
            return priceB - priceA;
          case "stock":
            return stockB - stockA;
          default:
            return nameA.localeCompare(nameB, "vi");
        }
      });
  }, [products, searchTerm, categoryFilter, stockFilter, sortBy]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const resetFilters = () => {
    setCategoryFilter("all");
    setStockFilter("all");
    setSortBy("name");
    setSearchTerm("");
    setCurrentPage(1);
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4 text-slate-500">
        <i className="fa-solid fa-spinner fa-spin text-3xl text-blue-600"></i>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Quản lý kho hàng</p>
          <h1 className="text-2xl font-bold text-slate-900">
            Danh sách sản phẩm
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <i className="fa-solid fa-rotate-right"></i> Đặt lại
          </button>
          <button
            onClick={() => handleShowModal(null)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <i className="fa-solid fa-plus"></i> Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Đang bán", value: stats.inStock, color: "border-blue-500" },
          {
            label: "Sắp hết",
            value: stats.lowStock,
            color: "border-yellow-500",
          },
          {
            label: "Hết hàng",
            value: stats.outOfStock,
            color: "border-red-500",
          },
          {
            label: "Giá trị kho",
            value: stats.inventoryValue.toLocaleString() + " đ",
            color: "border-green-500",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`rounded-xl border-l-4 bg-white p-5 shadow-sm ${stat.color}`}
          >
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/50 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-80">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="all">Tất cả danh mục</option>
              {localCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value as StockFilter);
                setCurrentPage(1);
              }}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="all">Tất cả kho</option>
              <option value="instock">Còn hàng</option>
              <option value="low">Sắp hết</option>
              <option value="outofstock">Hết hàng</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="name">Tên (A-Z)</option>
              <option value="priceAsc">Giá tăng dần</option>
              <option value="priceDesc">Giá giảm dần</option>
              <option value="stock">Tồn kho</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Ảnh</th>
                <th className="px-6 py-4">Tên sản phẩm</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Giá bán</th>
                <th className="px-6 py-4 text-center">Tồn kho</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-6 py-4">
                    <img
                      src={product.image}
                      className="h-12 w-12 rounded-lg object-cover border border-slate-200"
                      // onError={(e: any) =>
                      //   (e.target.src = "https://via.placeholder.com/150")
                      // }
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">
                      {product.name}
                    </div>
                    {product.featured && (
                      <span className="text-xs text-yellow-600 bg-yellow-50 px-1 rounded border border-yellow-200">
                        ★ Nổi bật
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
                      {getCategoryName(product.categoryId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-emerald-600 font-medium">
                    {product.price.toLocaleString()} đ
                  </td>
                  <td className="px-6 py-4 text-center">{product.stock}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                        product.stock > 0
                          ? product.stock <= 10
                            ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                            : "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {product.stock > 0
                        ? product.stock <= 10
                          ? "Sắp hết"
                          : "Còn hàng"
                        : "Hết hàng"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleShowModal(product)}
                        className="p-2 bg-yellow-300 text-white border rounded-lg hover:bg-yellow-50 hover:text-yellow-600"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 bg-red-500 text-white border rounded-lg hover:bg-red-5 hover:text-red-600 hover:bg-red-50"
                      >
                        <i className="fa-solid fa-trash-can"></i>Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Không tìm thấy sản phẩm
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end p-4 border-t">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`mx-1 px-3 py-1 rounded border ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <ProductFormModal
        show={showModal}
        onHide={handleHideModal}
        onSubmit={handleSubmitForm}
        product={editingProduct}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default ProductManager;
