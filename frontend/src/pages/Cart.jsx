import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/frontend_assets/assets";
import CartTotal from "../components/CartTotal";
import { toast } from "react-toastify";

const Cart = () => {
  // Lấy dữ liệu từ context
  const { products, currency, cartItems, updateQuantity, navigate } =useContext(ShopContext);
  console.log(cartItems);
  const getProductPrice = (itemId) => {
    const product = products.find((p) => p._id === itemId);
    if (!product) return 0;
    return product.discount
      ? Math.round(product.price * (1 - product.discount / 100)) // Giá sau giảm
      : Math.round(product.price); // Giá gốc
  };
  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>
      <div>
        {cartItems.map((item, index) => {
           const product = products.find((p) => p._id === item._id);
           const maxStock = product?.stock || 0;
          return (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
            >
              <div className="flex items-start gap-6">
                {/* Hiển thị ảnh sản phẩm */}
                <img
                  className="w-16 sm:w-20"
                  src={item.image[0]}
                  alt="Sản phẩm"
                />

                <div>
                  {/* Hiển thị tên sản phẩm */}
                  <p className="text-xs sm:text-lg font-medium">{item.name}</p>
                  <div className="flex items-center gap-5 mt-2">
                    {/* Hiển thị giá sản phẩm */}
                    <p>
                      {getProductPrice(item._id).toLocaleString("vi-VN")} {currency}
                    </p>
                    
                  </div>
                </div>
              </div>

              {/* Input chỉnh sửa số lượng sản phẩm */}
             <input
  onChange={(e) => {
    const newQuantity = Number(e.target.value);

    if (newQuantity > item.stock) {
      toast.error(`Sản phẩm chỉ còn ${item.stock} sản phẩm trong kho!`);
      e.target.value = item.quantity;
      return;
    }

    if (newQuantity >= 1) {
      updateQuantity(item._id, newQuantity);
    }
  }}
  className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
  type="number"
  min={1}
  max={item.stock}
  defaultValue={item.quantity}
/>


              {/* Nút xóa sản phẩm khỏi giỏ hàng */}
              <img
                onClick={() => updateQuantity(item._id, 0)}
                className="w-4 mr-4 sm:w-5 cursor-pointer"
                src={assets.bin_icon}
                alt="Xóa sản phẩm"
/>
            </div>
          );
        })}
      </div>

      {/* Hiển thị tổng tiền và nút thanh toán */}
      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal />
          <div className="w-full text-end">
            <button
              onClick={() => navigate("/place-order")}
              className="bg-black text-white text-sm my-8 px-8 py-3"
            >
              TIẾN HÀNH THANH TOÁN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
