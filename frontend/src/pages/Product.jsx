import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/frontend_assets/assets";
import { toast } from "react-toastify";
import axios from "axios";
import RelatedProducts from "../components/RelatedProducts";
import Comment from "../components/Comment";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const fetchRating = async () => {
  try {

    const response = await axios.get(
      `http://localhost:4000/api/comments/rating/${productId}`
    );

    setAverageRating(response.data.averageRating);
    setTotalReviews(response.data.totalReviews);

  } catch (err) {
    console.log(err);
  }
};

  useEffect(() => {

  const product = products.find(
    (item) => item._id === productId
  );

  if (product) {
    setProductData(product);
    setImage(product.image[0]);
    setComments(product.comments || []);
  }

  fetchRating();

}, [productId, products]);

  if (!productData) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Đang tải sản phẩm...
      </div>
    );
  }

  return (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* Product */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">

        {/* Ảnh */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                key={index}
                src={item}
                alt=""
                onClick={() => setImage(item)}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
              />
            ))}
          </div>

          <div className="w-full">
            <img src={image} alt="" className="w-full h-auto" />
          </div>
        </div>

        {/* Thông tin */}
        <div className="flex-1">

          <h1 className="font-medium text-2xl mt-2">
            {productData.name}
          </h1>

         <div className="flex items-center gap-1 mt-2">

          {[1,2,3,4,5].map((star)=>(
            <span
              key={star}
              className={`text-xl ${
                star <= Math.round(averageRating)
                  ? "text-yellow-500"
                  : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}

          <p className="pl-2">
            ({totalReviews})
          </p>

          <span className="ml-2 text-gray-600">
            {averageRating}/5
          </span>

        </div>

          <p className="mt-5 text-3xl font-medium">
            {Number(
              productData.discount > 0
                ? productData.price * (1 - productData.discount / 100)
                : productData.price
            ).toLocaleString("vi-VN")} {currency}
        </p>

          {productData.discount > 0 && (
            <p className="text-gray-500 line-through text-xl">
              {Number(productData.price).toLocaleString("vi-VN")} {currency}
            </p>
          )}

          <p className="my-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>

          {/* Tồn kho */}
          <p className="mb-6 text-green-600 font-medium">
            Còn lại: {productData.stock} sản phẩm
          </p>

          <button
            onClick={() => {
              if (productData.stock === 0) {
                toast.error("Sản phẩm đã hết hàng!");
                return;
              }

              addToCart(productData._id, productData.stock);
            }}
            className={`px-8 py-3 text-sm text-white ${
              productData.stock === 0
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-black active:bg-gray-700"
            }`}
            disabled={productData.stock === 0}
          >
            {productData.stock === 0
              ? "Hết hàng"
              : "Thêm vào giỏ hàng"}
          </button>

          <hr className="mt-8 sm:w-4/5" />

          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>✔ Sản phẩm handmade chất lượng cao.</p>
            <p>✔ Hỗ trợ thanh toán khi nhận hàng.</p>
            <p>✔ Đổi trả trong vòng 7 ngày nếu có lỗi.</p>
          </div>

        </div>
      </div>

      {/* Mô tả */}
      <div className="mt-20">

        <div className="flex">
          <b className="border px-5 py-3 text-sm">
            Mô tả
          </b>

        </div>

        <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
          <p>
            Sản phẩm handmade được làm thủ công với chất liệu an toàn,
            phù hợp để làm quà tặng hoặc trang trí.
          </p>

          <p>
            Mỗi sản phẩm đều được kiểm tra kỹ trước khi giao đến khách
            hàng nhằm đảm bảo chất lượng tốt nhất.
          </p>
        </div>

      </div>

      <Comment productId={productId} />

      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  );
};

export default Product;