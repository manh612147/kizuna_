import React, { useContext, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const BANK_ID = "MBBank";
  const BANK_ACCOUNT = "0368510005";
  const BANK_NAME = "LAI VAN MANH";
  
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandle = (event) => {
    const { name, value } = event.target;
    setFormData((data) => ({
      ...data,
      [name]: value,
    }));
  };

  const paymentAmount = getCartAmount() + delivery_fee;
  const qrContent = encodeURIComponent(`THANHTOAN ${paymentAmount}`);

  const qrUrl =
    `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT}-compact2.jpg` +
    `?amount=${paymentAmount}` +
    `&addInfo=${qrContent}` +
    `&accountName=${encodeURIComponent(BANK_NAME)}`;

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      // Tạo danh sách sản phẩm từ giỏ hàng
      const orderItems = cartItems.map((item) => ({
        productId:
          item.itemId?._id || item.itemId || item.productId || item._id,
        name: item.name || item.itemId?.name,
        quantity: Number(item.quantity),
        price: Number(item.price || item.itemId?.price),
        image: item.image || item.itemId?.image,
      }));

      if (orderItems.length === 0) {
        toast.error("Giỏ hàng không có sản phẩm!");
        return;
      }

      const orderData = {
        address: formData,
        userId: localStorage.getItem("userId"),
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      };

      // ================= COD =================
      if (method === "cod") {
        const response = await axios.post(
          backendUrl + "/api/order/place",
          orderData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          toast.success("Đặt hàng thành công!");
          setCartItems([]);
          localStorage.setItem("cartItems", JSON.stringify([]));
          navigate("/orders");
        } else {
          toast.error(response.data.message);
        }
      }

      // ================= CHUYỂN KHOẢN (Đã bỏ upload ảnh) =================
      else if (method === "bank") {
        // Gửi data dưới dạng JSON giống hệt COD
        const response = await axios.post(
          backendUrl + "/api/order/bank",
          orderData, 
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          toast.success("Đặt hàng thành công! Đang chờ Admin xác nhận thanh toán.");
          setCartItems([]);
          localStorage.setItem("cartItems", JSON.stringify([]));
          navigate("/orders");
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi đặt hàng!"
      );
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
    >
      {/* THÔNG TIN GIAO HÀNG */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1="THÔNG TIN" text2="GIAO HÀNG" />
        </div>

        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandle}
            name="firstName"
            value={formData.firstName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Họ"
          />
          <input
            required
            onChange={onChangeHandle}
            name="lastName"
            value={formData.lastName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Tên"
          />
        </div>

        <input
          required
          onChange={onChangeHandle}
          name="email"
          value={formData.email}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Địa chỉ Email"
        />

        <input
          required
          onChange={onChangeHandle}
          name="street"
          value={formData.street}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Địa chỉ"
        />

        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandle}
            name="city"
            value={formData.city}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Thành phố"
          />
          <input
            required
            onChange={onChangeHandle}
            name="state"
            value={formData.state}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Tỉnh"
          />
        </div>

        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandle}
            name="zipcode"
            value={formData.zipcode}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Zipcode"
          />
          <input
            required
            onChange={onChangeHandle}
            name="country"
            value={formData.country}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Quốc gia"
          />
        </div>

        <input
          required
          onChange={onChangeHandle}
          name="phone"
          value={formData.phone}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="tel"
          placeholder="Số điện thoại"
        />
      </div>

      {/* THANH TOÁN */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>

        <div className="mt-12">
          <Title text1="PHƯƠNG THỨC" text2="THANH TOÁN" />

          <div className="flex gap-3 flex-col">
            {/* CHUYỂN KHOẢN */}
            <div
              onClick={() => setMethod("bank")}
              className="flex items-center gap-3 border p-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "bank" ? "bg-green-400" : ""
                }`}
              />
              <p className="text-gray-600 text-sm font-medium">
                CHUYỂN KHOẢN NGÂN HÀNG
              </p>
            </div>

            {/* COD */}
            <div
              onClick={() => setMethod("cod")}
              className="flex items-center gap-3 border p-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "cod" ? "bg-green-400" : ""
                }`}
              />
              <p className="text-gray-600 text-sm font-medium">
                THANH TOÁN KHI NHẬN HÀNG
              </p>
            </div>
          </div>

          {/* HIỂN THỊ KHI CHỌN CHUYỂN KHOẢN */}
          {method === "bank" && (
            <div className="mt-5 border p-4 rounded bg-gray-50">
              <h3 className="font-medium mb-3 text-center">
                Quét mã QR để chuyển khoản
              </h3>

              <img
                src={qrUrl}
                alt="Mã QR chuyển khoản"
                className="w-64 mx-auto mb-4 rounded-lg shadow-sm"
              />

              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">Số tiền cần chuyển</p>
                <p className="text-2xl font-bold text-red-600">
                  {paymentAmount.toLocaleString("vi-VN")} ₫
                </p>
              </div>

              <p className="text-sm text-gray-700 mb-2 text-center px-4 font-medium">
                Vui lòng kiểm tra đúng số tiền và nội dung trước khi chuyển khoản.
              </p>
              <p className="text-sm text-gray-500 mb-2 text-center px-4">
                Sau khi thao tác chuyển tiền thành công, hãy nhấn nút <span className="font-bold">Xác nhận đã chuyển khoản</span> ở bên dưới để hoàn tất đơn hàng.
              </p>
            </div>
          )}

          <div className="w-full text-end mt-8">
            <button
              type="submit"
              className="bg-black text-white px-10 py-3 text-sm font-bold tracking-wide rounded hover:bg-gray-800 transition"
            >
              {method === "bank" ? "XÁC NHẬN ĐÃ CHUYỂN KHOẢN" : "ĐẶT HÀNG"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;