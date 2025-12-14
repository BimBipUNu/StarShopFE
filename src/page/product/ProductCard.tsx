import { useState } from "react";
import type { ProductType } from "../../types/productType";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import type { CategoryType } from "../../types/categoryType";

function ProductCard({ product }: { product: ProductType }) {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  // Lấy danh mục từ Redux để hiển thị tên
  const categories: CategoryType[] = useSelector(
    (state: RootState) => state.category.items
  );
  const categoryName =
    categories.find((c: CategoryType) => c.id === product.categoryId)?.name ||
    "Sản phẩm";

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const handleClick = () => {
    navigate(`/home/product/${product.id}`);
  };

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 cursor-pointer h-full"
      onClick={handleClick}
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        {product.image && !imageError ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-300">
            <FontAwesomeIcon icon={faImage} className="text-4xl" />
          </div>
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-blue-600/90 py-3 text-center text-white backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
          <span className="text-sm font-medium">Xem chi tiết</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category */}
        <span className="mb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
          {categoryName}
        </span>

        {/* Name */}
        <h3
          className="mb-2 text-base font-bold text-slate-800 line-clamp-2 min-h-[3rem] group-hover:text-blue-600 transition-colors"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Price & Stock */}
        <div className="mt-auto flex items-end justify-between border-t border-slate-50 pt-3">
          <span className="text-lg font-bold text-blue-600">
            {formatPrice(product.price)}
          </span>

          {product.stock > 0 ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Còn hàng
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
              Hết hàng
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
