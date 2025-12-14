import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import type { ProductType } from "../../types/productType";
import { fetchAllProducts, fetchProductDetail } from "../../slice/productSlice";
import { addToCart } from "../../slice/cartSlice";
import toast from "react-hot-toast";

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetail(Number(id)));
      window.scrollTo(0, 0);
    }
  }, [dispatch, id]);
  // Lấy state từ Redux
  const {
    selectedProduct,
    isLoading,
    error,
    items: allProducts,
  } = useSelector((state: RootState) => state.product);

  const [quantity, setQuantity] = useState(1);
  const [relatedProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    if (allProducts.length === 0) {
      dispatch(fetchAllProducts());
    }
  }, [dispatch, allProducts.length]);

  // useEffect(() => {
  //   if (selectedProduct && allProducts.length > 0) {
  //     const related = allProducts
  //       .filter(
  //         (p) =>
  //           p.categoryId === selectedProduct.categoryId &&
  //           p.id !== selectedProduct.id
  //       )
  //       .slice(0, 4);
  //     setRelatedProducts( related);
  //   }
  // }, [selectedProduct, allProducts]);

  // --- HANDLERS ---
  const handleQuantityChange = (delta: number) => {
    if (!selectedProduct) return;
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= selectedProduct.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    if (quantity > selectedProduct.stock) {
      toast.error("Không đủ hàng!");
      return;
    }

    try {
      await dispatch(
        addToCart({
          productId: selectedProduct.id,
          quantity: quantity,
        })
      );
      toast.success("Thêm vào giỏ hàng thành công!");
    } catch (err) {
      console.error("Lỗi:", err);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedProduct) return;
    if (quantity > selectedProduct.stock) {
      toast.error("Không đủ hàng!");
      return;
    }

    try {
      await dispatch(
        addToCart({
          productId: selectedProduct.id,
          quantity: quantity,
        })
      );
      navigate("/home/cart");
    } catch (err) {
      console.log("Lỗi mua hàng", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium">
          Đang tải thông tin sản phẩm...
        </p>
      </div>
    );
  }

  if (error || !selectedProduct) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <div className="mb-6 flex justify-center text-red-100">
          <div className="rounded-full bg-red-50 p-6">
            <i className="fa-solid fa-triangle-exclamation text-4xl text-red-500"></i>
          </div>
        </div>
        <h2 className="mb-4 text-2xl font-bold text-slate-800">
          {error || "Không tìm thấy sản phẩm"}
        </h2>
        <Link
          to="/home/product"
          className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i> Quay lại danh sách
        </Link>
      </div>
    );
  }

  // const isOutOfStock = selectedProduct.stock === 0;
  const isOutOfStock = selectedProduct && selectedProduct.stock <= 0;
  return (
    <div className="bg-white pb-20 pt-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb / Back Button */}
        <div className="mb-8">
          <Link
            to="/home/product"
            className="group inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            <span className="mr-2 rounded-full bg-slate-100 p-2 transition group-hover:bg-blue-50">
              <i className="fa-solid fa-arrow-left"></i>
            </span>
            Quay lại danh sách
          </Link>
        </div>

        {/* --- MAIN PRODUCT DETAIL --- */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="h-full w-full object-contain transition-transform duration-500 hover:scale-105"
                style={{ maxHeight: "500px" }}
              />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            {/* Category & Rating */}
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
                {selectedProduct.categoryId || "General"}
              </span>
              <div className="flex items-center text-yellow-400">
                <i className="fa-solid fa-star"></i>
                <span className="ml-1 text-sm font-bold text-slate-700">
                  4.8
                </span>
                <span className="ml-1 text-xs text-slate-400">
                  (120 đánh giá)
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              {selectedProduct.name}
            </h1>

            {/* Price */}
            <div className="mb-6 flex items-end gap-4">
              <p className="text-3xl font-bold text-blue-600">
                {selectedProduct.price.toLocaleString()}{" "}
                <span className="text-lg">VND</span>
              </p>
              {/* Giả lập giá cũ nếu muốn */}
              {/* <p className="text-lg text-slate-400 line-through decoration-2">
                 {(selectedProduct.price * 1.2).toLocaleString()} VND
              </p> */}
            </div>

            {/* Description */}
            <div className="mb-8 border-t border-b border-slate-100 py-6">
              <h3 className="mb-3 text-sm font-bold uppercase text-slate-900">
                Mô tả sản phẩm
              </h3>
              <p className="leading-relaxed text-slate-600">
                {selectedProduct.description}
              </p>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-3 w-3 rounded-full ${
                    isOutOfStock ? "bg-red-500" : "bg-green-500"
                  }`}
                ></span>
                <span
                  className={`font-medium ${
                    isOutOfStock ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {isOutOfStock
                    ? "Hết hàng"
                    : `Còn hàng (${selectedProduct.stock} sản phẩm)`}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8 flex items-center gap-6">
              <span className="text-sm font-bold text-slate-900">
                Số lượng:
              </span>
              <div className="flex items-center rounded-lg border border-slate-200">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <i className="fa-solid fa-minus"></i>
                </button>
                <input
                  type="number"
                  className="w-16 border-none bg-transparent text-center font-bold text-slate-900 focus:ring-0"
                  value={quantity}
                  readOnly
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= selectedProduct.stock || isOutOfStock}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>

            {/* Actions Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 rounded-xl border-2 border-blue-600 bg-white px-8 py-4 font-bold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <i className="fa-solid fa-cart-plus mr-2"></i> Thêm vào giỏ
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 rounded-xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>

        {/* --- RELATED PRODUCTS --- */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-slate-100 pt-16">
            <h2 className="mb-8 text-2xl font-bold text-slate-900">
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/home/product/${product.id}`)}
                  className="group cursor-pointer rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-slate-50">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-blue-600">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-blue-600">
                      {product.price.toLocaleString()} đ
                    </p>
                    {product.stock === 0 && (
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                        Hết hàng
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
