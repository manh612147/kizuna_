import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const statusMapping = {
    "Order Placed": "📦 Đơn hàng đã đặt",
    "Packing": "📦 Đang đóng gói",
    "Shipped": "🚚 Đang vận chuyển",
    "Out for delivery": "🚀 Đang giao hàng",
    "Delivered": "✅ Đã giao",
    "Cancelled": "❌ Đơn hàng đã bị hủy",
  };

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axios.get(
        `${backendUrl}/api/order/userorders/${localStorage.getItem('userId') || ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setOrderData(response.data.orders.reverse());
    } else {
        setOrderData([]);
    }
          
    } catch (error) {
      console.error("❌ Lỗi khi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderData();
    
  }, [token]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1="ĐƠN" text2="HÀNG CỦA TÔI" />
      </div>

      {loading ? (
        <p className="text-center text-gray-500 mt-6">Đang tải đơn hàng...</p>
      ) : orderData.length > 0 ? (
        orderData.map((order,index)=>(
          <div
            key={index}
            className="py-4 border-t text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            {/* Thông tin sản phẩm */}
            <div className="flex items-start gap-6 text-sm">
              <img
                src={order.items[0].image[0]}
                alt=''
                className="w-16 sm:w-20"
              />
              <div>
                <p className="sm:text-base font-medium">
                  {order.items[0].name}

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-500 text-sm">
                        Mã đơn:
                    </span>

                    <span
                        className="
                            px-3 py-1
                            rounded-full
                            bg-indigo-50
                            border border-indigo-200
                            text-indigo-700
                            text-xs
                            font-bold
                            tracking-wider
                        "
                    >
                        {order.orderCode}
                    </span>
                </div>
              </p>
                <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                  <p>
                    Tổng thanh toán:
                    <span className="font-semibold text-red-500 ml-2">
                      {Number(order.amount).toLocaleString("vi-VN")} {currency}
                    </span>
                  </p>
                  <p>
                    Tổng số lượng:
                    {" "}
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </div>
                <p className="mt-1">
                  Ngày đặt: <span className="text-gray-400">{new Date(order.date).toDateString()}</span>
                </p>
                <p className="mt-1">
                  Thanh toán:{" "}
                  <span className="text-gray-400">{order.paymentMethod}</span>
                </p>
                <div className="mt-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedOrder(
                          expandedOrder === order._id ? null : order._id
                        )
                      }
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {expandedOrder === order._id
                        ? "▲ Thu gọn"
                        : "▼ Xem chi tiết"}
                    </button>
                  </div>
{
  expandedOrder === order._id && (

  <div className="mt-4 border rounded-lg p-3 bg-gray-50">

      <h4 className="font-semibold mb-3">
          Chi tiết đơn hàng
      </h4>

      {
          order.items.map((item,index)=>(

              <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
              >

                  <div className="flex items-center gap-3">

                      <img
                          src={item.image[0]}
                          className="w-12 h-12 rounded object-cover"
                          alt=""
                      />

                      <div>
                          <p className="font-medium">
                              {item.name}
                          </p>

                          <p className="text-sm text-gray-500">
                              Số lượng: {item.quantity}
                          </p>
                      </div>

                  </div>

                  <div className="font-semibold">
                      {Number(item.price).toLocaleString("vi-VN")} {currency}
                  </div>

              </div>

          ))
      }

  </div>

  )
}
                {
                  order.status === "Cancelled" &&
                  order.cancelReason && (
                    <p className="mt-2 text-red-600 font-medium">
                      Lý do hủy:
                      <br />
                      {order.cancelReason}
                    </p>
                )
                }
              </div>
            </div>

            {/* Trạng thái đơn hàng & nút theo dõi */}
            <div className="md:w-1/2 flex justify-between">
              <div className="flex items-center gap-2">
                <p className={`min-w-2 h-2 rounded-full ${
                        order.status === "Cancelled"
                          ? "bg-red-500"
                          : order.status === "Delivered"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}></p>
                <p className="text-sm sm:text-[15px]">
                  {statusMapping[order.status] || "Không xác định"}
                </p>
              </div>
              <button
                onClick={loadOrderData}
                className="border px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-200 transition-all"
              >
                THEO DÕI ĐƠN HÀNG
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 mt-6">Không có đơn hàng nào.</p>
      )}
    </div>
  );
};

export default Orders;
