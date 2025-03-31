import React, { useContext } from "react";
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductItem = ({
    id,
    image,
    name,
    price,
    stock,
    discount,
    showStock = false
}) => {
  const {
  currency,
  favoriteIds,
  setFavoriteIds
} = useContext(ShopContext);

const favorite = favoriteIds.includes(id);
 
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const userId = localStorage.getItem("userId");

  const toggleFavorite = async (e) => {
  e.preventDefault();

  if (!userId) {
    toast.error("Vui lòng đăng nhập!");
    return;
  }

  try {
    if (favorite) {
      // Xóa khỏi yêu thích
      await axios.delete(
        `${backendUrl}/api/favorites/${userId}/${id}`
      );

      setFavoriteIds(prev =>
        prev.filter(item => item !== id)
      );

      toast.success("Đã xóa khỏi danh sách yêu thích");
    } else {
      // Thêm yêu thích
      await axios.post(
        `${backendUrl}/api/favorites`,
        {
          productId: id,
          userId,
        }
      );

      setFavoriteIds(prev => [...prev, id]);

      toast.success("Đã thêm vào danh sách yêu thích");
    }
  } catch (error) {
    console.error(error);
    toast.error("Có lỗi xảy ra!");
  }
};

return (
  <Link
    to={`/product/${id}`}
    className="
      group block relative overflow-hidden
      bg-white border border-gray-200
      border-5 border-green-300
      rounded-2xl shadow-sm
      hover:shadow-xl hover:-translate-y-1
      transition-all duration-300
    "
  >
    {/* ẢNH SẢN PHẨM */}
    <div className="relative h-[230px] overflow-hidden bg-gray-100">
      <img
        className="
          w-full h-full object-cover
          group-hover:scale-110
          transition-transform duration-500
        "
        src={image?.[0]}
        alt={name}
      />

      {/* Lớp tối nhẹ khi hover */}
      <div className="
        absolute inset-0 bg-black/0
        group-hover:bg-black/5
        transition duration-300
      " />

      {/* HẾT HÀNG */}
      {stock === 0 && (
        <div className="
          absolute top-3 left-3
          bg-red-600 text-white
          text-xs font-semibold
          px-3 py-1.5 rounded-full
          shadow-md
        ">
          HẾT HÀNG
        </div>
      )}

      {/* GIẢM GIÁ */}
      {discount > 0 && (
        <div className="
          absolute bottom-3 left-3
          bg-yellow-400 text-gray-900
          text-xs font-bold
          px-3 py-1.5 rounded-full
          shadow-md
        ">
          -{discount}%
        </div>
      )}

      {/* YÊU THÍCH */}
      <button
        type="button"
        onClick={toggleFavorite}
        className="
          absolute top-3 right-3 z-10
          w-10 h-10
          flex items-center justify-center
          bg-white/90 backdrop-blur-sm
          rounded-full shadow-md
          hover:scale-110 hover:bg-red-50
          transition-all duration-200
        "
      >
        {favorite ? (
          <FaHeart className="text-red-500 text-lg" />
        ) : (
          <FaRegHeart className="text-gray-500 text-lg" />
        )}
      </button>
    </div>

    {/* THÔNG TIN SẢN PHẨM */}
    <div className="p-4">
      <h3 className="
        text-gray-800 font-semibold
        text-base mb-2
        line-clamp-2
        group-hover:text-black
        transition
      ">
        {name}
      </h3>

      {/* GIÁ */}
      <div className="flex flex-wrap items-center gap-2">
        {discount > 0 ? (
          <>
            <span className="text-red-600 text-base font-bold">
              {Number(
                price * (1 - discount / 100)
              ).toLocaleString("vi-VN")}{" "}
              {currency}
            </span>

            <span className="text-gray-400 text-sm line-through">
              {Number(price).toLocaleString("vi-VN")} {currency}
            </span>
          </>
        ) : (
          <span className="text-gray-900 text-base font-bold">
            {Number(price).toLocaleString("vi-VN")} {currency}
          </span>
        )}
      </div>

      {/* SỐ LƯỢNG */}
      {showStock && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p
            className={`text-sm font-medium ${
              stock > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {stock > 0
              ? `Còn ${stock} sản phẩm`
              : "Sản phẩm đã hết hàng"}
          </p>
        </div>
      )}
    </div>
  </Link>
);
};

export default ProductItem;
