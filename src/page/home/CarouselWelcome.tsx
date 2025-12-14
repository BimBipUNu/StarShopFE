import { useState, useEffect } from "react";

const slides = [
  {
    image:
      "https://res.cloudinary.com/dyle696tg/image/upload/v1764638838/Screenshot_2025-12-01_190122_aumbrg.png",
    title: "Chào mừng đến StartShop",
    description: "Sản phẩm chính hãng, giá tốt nhất",
  },
  {
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200",
    title: "Công nghệ hàng đầu",
    description: "iPhone, Samsung, MacBook và nhiều hơn nữa",
  },
  {
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200",
    title: "Ưu đãi đặc biệt",
    description: "Giảm giá lên đến 30% cho các sản phẩm chọn lọc",
  },
];

function CarouselWelcome() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  // Tự động chuyển slide sau 5 giây
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div className="relative w-full h-[500px] group overflow-hidden bg-slate-900">
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Background Image */}
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Overlay: Tạo lớp phủ đen mờ để chữ dễ đọc hơn */}
              <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Caption Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg transform transition-all duration-700 translate-y-0">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl font-light drop-shadow-md">
                {slide.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-5 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 focus:outline-none hidden group-hover:block transition-all"
        aria-label="Previous Slide"
      >
        <i className="fa-solid fa-chevron-left text-2xl w-8 h-8 flex items-center justify-center"></i>
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-5 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 focus:outline-none hidden group-hover:block transition-all"
        aria-label="Next Slide"
      >
        <i className="fa-solid fa-chevron-right text-2xl w-8 h-8 flex items-center justify-center"></i>
      </button>

      {/* Dots Indicators (Nằm ở dưới cùng) */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 w-3 rounded-full transition-all duration-300 focus:outline-none ${
              index === currentIndex
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default CarouselWelcome;
