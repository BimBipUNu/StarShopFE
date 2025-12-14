import { useEffect, useState, useMemo } from "react";
import CarouselWelcome from "./CarouselWelcome";
import ProductCard from "../product/ProductCard";
import CategoriesList from "../../component/CategoriesList";
import type { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCategories } from "../../slice/categorySlice";
import { fetchAllProducts } from "../../slice/productSlice";

function HomeLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllCategories());
    dispatch(fetchAllProducts());
  }, [dispatch]);

  const {
    items: products,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.product);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // --- LOGIC LỌC SẢN PHẨM ---
  const displayedProducts = useMemo(() => {
    // 1. Nếu đang tìm kiếm: Lọc theo tên (không phân biệt hoa thường)
    if (searchTerm.trim()) {
      return products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // 2. Nếu không tìm kiếm: Chỉ hiện sản phẩm nổi bật
    return products.filter((product) => product.featured);
  }, [products, searchTerm]);

  return (
    <div className="w-full pb-20 bg-slate-50/30">
      {/* 1. Carousel */}
      <CarouselWelcome />

      <div className="container mx-auto px-4 mt-8 flex flex-col space-y-12">
        {/* 2. Search Bar */}
        <div className="w-full max-w-2xl mx-auto">
          <div className="relative flex items-center w-full group">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Bạn muốn tìm gì hôm nay? (iPhone, Samsung...)"
              className="w-full rounded-full border border-slate-300 bg-white py-4 pl-14 pr-12 text-slate-700 shadow-md transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:shadow-lg"
            />
            <div className="absolute left-5 text-xl text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>

            {/* Nút xóa tìm kiếm (chỉ hiện khi có text) */}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-red-500 transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>

        {/* 3. Categories List */}
        <CategoriesList />

        {/* 4. Products Section */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-800 relative">
              {searchTerm ? "Kết quả tìm kiếm" : "Sản phẩm nổi bật"}
              <span className="absolute bottom-[-17px] left-0 w-1/2 h-1.5 bg-blue-600 rounded-t-full"></span>
            </h2>

            {/* Hiển thị số lượng kết quả */}
            {!isLoading && (
              <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {displayedProducts.length} sản phẩm
              </span>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-slate-500 font-medium">Đang tải sản phẩm...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mx-auto max-w-lg rounded-xl bg-red-50 p-6 text-center text-red-600 border border-red-100 shadow-sm">
              <i className="fa-solid fa-circle-exclamation text-3xl mb-3"></i>
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && !error && (
            <>
              {displayedProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <i className="fa-solid fa-box-open text-4xl text-slate-300"></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">
                    Không tìm thấy sản phẩm nào
                  </h3>
                  <p className="text-slate-500">
                    Thử tìm kiếm với từ khóa khác xem sao!
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default HomeLayout;
