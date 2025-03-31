import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import Title from "../components/Title";

const FavoriteProducts = () => {
  const [favorites, setFavorites] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      console.error("Thiếu userId, không thể lấy danh sách yêu thích.");
      return;
    }

    const fetchFavorites = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/favorites/${userId}`
        );
        setFavorites(response.data.favorites);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu thích:", error);
      }
    };

    fetchFavorites();
  }, [userId]);

  const removeFavorite = async (productId) => {
    try {
      await axios.delete(
        `${backendUrl}/api/favorites/${userId}/${productId}`
      );

      toast.success("Xóa thành công khỏi danh sách yêu thích");

      setFavorites(
        favorites.filter((fav) => fav.product._id !== productId)
      );
    } catch (error) {
      console.error("Lỗi khi xóa khỏi yêu thích:", error);
    }
  };

  // Định dạng tiền Việt Nam
  const formatPrice = (price) => {
    return Number(price).toLocaleString("vi-VN") + " đ";
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-2xl">
        <Title
          text1="SẢN PHẨM"
          text2="YÊU THÍCH CỦA TÔI"
        />
      </div>

      {favorites.length === 0 ? (
        <p className="text-gray-500">
          Bạn chưa có sản phẩm yêu thích nào.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map(({ product }) => (
            <Link
              key={product._id}
              className="text-gray-700 cursor-pointer relative block"
              to={`/product/${product._id}`}
            >
              <div className="relative overflow-hidden shadow-md">
                <img
                  className="w-full hover:scale-110 transition ease-in-out"
                  src={product.image[0]}
                  alt={product.name}
                />

                {/* Hiển thị giảm giá */}
                {product.discount > 0 && (
                  <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    -{product.discount}%
                  </div>
                )}

                {/* Nút trái tim */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFavorite(product._id);
                  }}
                  className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-red-100 hover:scale-110 transition"
                >
                  <FaHeart className="text-red-500 text-lg" />
                </button>
              </div>

              <p className="pt-3 pb-1 text-sm">
                {product.name}
              </p>

              {/* Hiển thị giá */}
              <p className="text-sm font-medium">
                {product.discount > 0 ? (
                  <>
                    <span className="text-red-500">
                      {formatPrice(
                        product.price *
                          (1 - product.discount / 100)
                      )}
                    </span>

                    <span className="text-gray-500 line-through ml-2">
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span>
                    {formatPrice(product.price)}
                  </span>
                )}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteProducts;