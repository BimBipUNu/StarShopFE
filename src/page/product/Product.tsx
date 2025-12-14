/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo, useRef } from "react";
import { fetchAllProducts } from "../../slice/productSlice";
import { fetchAllCategories } from "../../slice/categorySlice";
import { useNavigate, useLocation } from "react-router-dom";
import ProductCard from "./ProductCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faMagnifyingGlass,
  faSpinner,
  faChevronLeft,
  faChevronRight,
  faFilter,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import type { RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc";

function Product() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { items: products, isLoading: loading } = useSelector(
    (state: RootState) => state.product
  );
  const { items: categories } = useSelector(
    (state: RootState) => state.category
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategoryId, setFilterCategoryId] = useState<string>("");
  const itemsPerPage = 12;

  const searchInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch dữ liệu khi mount
  useEffect(() => {
    dispatch(fetchAllProducts(undefined) as any);
    dispatch(fetchAllCategories() as any);
  }, [dispatch]);

  // 2. Đồng bộ State với URL Params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryIdFromUrl = queryParams.get("categoryId");

    if (categoryIdFromUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilterCategoryId(categoryIdFromUrl);
    } else {
      setFilterCategoryId(""); // Reset về chuỗi rỗng
    }
    const searchFromUrl = queryParams.get("search");

    if (searchFromUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchTerm(decodeURIComponent(searchFromUrl));
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    if (categoryIdFromUrl) {
      setFilterCategoryId(categoryIdFromUrl);
    } else {
      setFilterCategoryId("");
    }
  }, [location.search]);

  // 3. Logic Lọc & Sắp xếp
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = Array.isArray(products) ? products : [];

    if (filterCategoryId) {
      filtered = filtered.filter(
        (product) => String(product.categoryId) === String(filterCategoryId)
      );
    }
    // Lọc theo Search
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sắp xếp
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return sorted;
  }, [products, searchTerm, sortOption, filterCategoryId]);

  // 4. Phân trang
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handlers
  const handleFilterChange = (categoryId: string) => {
    setFilterCategoryId(categoryId);
    setCurrentPage(1);

    const queryParams = new URLSearchParams(location.search);
    if (categoryId) {
      queryParams.set("categoryId", categoryId);
    } else {
      queryParams.delete("categoryId");
    }
    // Giữ lại search param nếu có
    if (searchTerm) {
      queryParams.set("search", searchTerm);
    }
    navigate({ search: queryParams.toString() });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);

    const queryParams = new URLSearchParams(location.search);
    if (term) {
      queryParams.set("search", term);
    } else {
      queryParams.delete("search");
    }
    navigate({ search: queryParams.toString() });
  };

  // --- Render Loading ---
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-slate-500">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          className="text-5xl text-blue-600"
        />
        <p className="text-lg font-medium">Đang tải sản phẩm...</p>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-8">
      <div className="container mx-auto max-w-[1400px] px-4">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-800">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <FontAwesomeIcon icon={faBox} />
            </span>
            Tất cả sản phẩm
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Hiển thị{" "}
            <span className="font-bold text-slate-800">
              {filteredAndSortedProducts.length}
            </span>{" "}
            sản phẩm
          </p>
        </div>

        {/* Filters & Controls */}
        <div className="mb-10 grid gap-6 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 md:grid-cols-[2fr_1fr_1fr]">
          {/* 1. Search Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              ref={searchInputRef}
              className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:shadow-md"
            />
          </div>

          {/* 2. Category Select */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
              <FontAwesomeIcon icon={faFilter} />
            </div>
            <select
              value={filterCategoryId}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-xl border-2 border-slate-100 bg-slate-50 py-3 pl-11 pr-10 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:shadow-md"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
              <i className="fa-solid fa-chevron-down text-xs"></i>
            </div>
          </div>

          {/* 3. Sort Select */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value as SortOption);
                setCurrentPage(1);
              }}
              className="w-full cursor-pointer appearance-none rounded-xl border-2 border-slate-100 bg-slate-50 py-3 px-4 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:shadow-md"
            >
              <option value="name-asc">Tên: A → Z</option>
              <option value="name-desc">Tên: Z → A</option>
              <option value="price-asc">Giá: Tăng dần</option>
              <option value="price-desc">Giá: Giảm dần</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
              <i className="fa-solid fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {paginatedProducts.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-20 text-center">
            <div className="rounded-full bg-slate-100 p-6 text-slate-300">
              <FontAwesomeIcon icon={faBoxOpen} className="text-5xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">
              Không tìm thấy sản phẩm nào
            </h3>
            <p className="text-slate-500">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedProducts.map((product) => (
              // Sử dụng Component ProductCard để hiển thị
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center">
            <nav className="flex items-center gap-2 rounded-xl bg-white p-2 shadow-sm border border-slate-100">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-100 text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-xs font-bold">«</span>
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-100 text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
              </button>

              <div className="flex items-center gap-1 px-2 hidden sm:flex">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Logic hiển thị ellipsis (...)
                    if (totalPages <= 7) return true;
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    );
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-slate-300">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-100 text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-100 text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-xs font-bold">»</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

export default Product;
