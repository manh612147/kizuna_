import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/admin_assets/assets";

const Order = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Lấy danh sách đơn hàng
  const fetchAllOrders = async () => {
    if (!token) return;
    try {
      const response = await axios.post(`${backendUrl}/api/order/list`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi lấy đơn hàng.");
    }
  };

  // Cập nhật trạng thái đơn hàng
  const statusHandler = async (event, orderId) => {
    const status = event.target.value;
    let cancelReason = "";

    // Nếu chọn hủy đơn thì yêu cầu nhập lý do
    if (status === "Cancelled") {
      cancelReason = prompt("Nhập lý do hủy đơn:");
      if (!cancelReason) {
        toast.error("Bạn phải nhập lý do hủy!");
        await fetchAllOrders();
        return;
      }
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        {
          orderId,
          status,
          cancelReason
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success("Cập nhật trạng thái thành công");
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái đơn hàng.");
    }
  };

  const confirmBankPayment = async (orderId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/confirm-bank-payment`,
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Đã xác nhận thanh toán!");
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lỗi khi xác nhận thanh toán."
      );
    }
  };

  // Chuyển ngày về dạng YYYY-MM-DD
  const formatDateForFilter = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Chuyển ngày nhập từ dd/mm/yyyy sang yyyy-mm-dd
  const convertToISODate = (date) => {
    if (!date) return "";
    const parts = date.split("/");
    if (parts.length !== 3) return "";
    const [day, month, year] = parts;
    if (
      day.length !== 2 ||
      month.length !== 2 ||
      year.length !== 4
    ) {
      return "";
    }
    return `${year}-${month}-${day}`;
  };

  // Danh sách đơn hàng sau khi lọc ngày + trạng thái
  const filteredOrders = orders.filter((order) => {
    const orderDate = formatDateForFilter(order.date);
    const fromISO = convertToISODate(fromDate);
    const toISO = convertToISODate(toDate);

    // Lọc từ ngày
    if (fromISO && orderDate < fromISO) {
      return false;
    }

    // Lọc đến ngày
    if (toISO && orderDate > toISO) {
      return false;
    }

    // Lọc trạng thái
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }

    return true;
  });

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h3 className="mb-8 text-3xl font-bold text-gray-800">
        🛒 Quản lý đơn hàng
      </h3>

      {/* ================= BỘ LỌC NGÀY ================= */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h4 className="text-lg font-bold text-gray-800">
            🔎 Lọc đơn hàng theo ngày
          </h4>
          <p className="mt-1 text-sm text-gray-500">
            Chọn khoảng thời gian để tìm kiếm đơn hàng
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {/* Từ ngày */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Từ ngày
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Đến ngày */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Đến ngày
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Trạng thái */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Order Placed">Đã đặt hàng</option>
              <option value="Packing">Đang đóng gói</option>
              <option value="Shipped">Đang vận chuyển</option>
              <option value="Out for delivery">Đang giao hàng</option>
              <option value="Delivered">Đã giao hàng</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Nút xóa bộ lọc */}
          <button
            type="button"
            onClick={() => {
              setFromDate("");
              setToDate("");
              setStatusFilter("all");
            }}
            className="rounded-lg bg-gray-600 px-5 py-2.5 text-white transition hover:bg-gray-700"
          >
            Xóa bộ lọc
          </button>
        </div>
        
        {/* Thống kê */}
        <div className="mt-4 border-t pt-4 text-sm text-gray-600">
          Hiển thị{" "}
          <span className="font-bold text-blue-600">
            {filteredOrders.length}
          </span>{" "}
          /{" "}
          <span className="font-bold">
            {orders.length}
          </span>{" "}
          đơn hàng

          {fromDate && (
            <span className="ml-3">
              Từ:{" "}
              <b>
                {new Date(fromDate + "T00:00:00").toLocaleDateString("vi-VN")}
              </b>
            </span>
          )}

          {toDate && (
            <span className="ml-3">
              Đến:{" "}
              <b>
                {new Date(toDate + "T00:00:00").toLocaleDateString("vi-VN")}
              </b>
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
            >
              <div className="grid grid-cols-12 gap-6 p-6">
                {/* ================= SẢN PHẨM ================= */}
                <div className="col-span-4 flex items-start gap-5">
                  <img
                    src={order.items[0]?.image?.[0]}
                    alt={order.items[0]?.name}
                    className="h-32 w-32 flex-shrink-0 rounded-xl border object-cover shadow-sm"
                  />
                  <div className="flex flex-1 flex-col">
                    <h2 className="text-xl font-bold leading-7 text-gray-800">
                      {order.items[0]?.name}
                      {order.items.length > 1 && (
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          +{order.items.length - 1} sản phẩm khác
                        </span>
                      )}
                    </h2>
                    <p className="mt-3 text-gray-600">
                      Tổng số lượng:
                      <span className="ml-2 font-semibold text-gray-800">
                        {order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}
                      </span>
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-700">
                      Mã sản phẩm:
                      <span className="ml-2 font-mono text-gray-900">
                        {order.items[0]?.productCode}
                      </span>
                    </p>
                    <button
                      type="button"
                      className="mt-4 w-fit text-sm font-semibold text-blue-600 transition hover:text-blue-800 hover:underline"
                      onClick={() =>
                        setExpandedOrder(
                          expandedOrder === order._id ? null : order._id
                        )
                      }
                    >
                      {expandedOrder === order._id ? "▲ Thu gọn" : "▼ Xem chi tiết"}
                    </button>

                    <div className="mt-5 space-y-2 rounded-lg bg-gray-50 p-4 text-[15px]">
                      <p>
                        <span className="font-semibold text-gray-700">
                          Người nhận:
                        </span>{" "}
                        {order.address.firstName} {order.address.lastName}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">
                          Địa chỉ:
                        </span>{" "}
                        {order.address.street}, {order.address.city}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">
                          SĐT:
                        </span>{" "}
                        {order.address.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {expandedOrder === order._id && (
                  <div className="col-span-12 mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-800">
                        📦 Chi tiết đơn hàng
                      </h3>
                      <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
                        {order.items.length} sản phẩm
                      </span>
                    </div>
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md"
                        >
                          <div className="flex items-center gap-5">
                            <img
                              src={item.image[0]}
                              alt={item.name}
                              className="h-20 w-20 rounded-xl border object-cover"
                            />
                            <div>
                              <h4 className="text-lg font-semibold text-gray-800">
                                {item.name}
                              </h4>
                              <p className="mt-1 text-sm text-gray-500">
                                Mã SP:
                                <span className="ml-2 font-mono text-gray-700">
                                  {item.productCode}
                                </span>
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                Số lượng:
                                <span className="ml-2 font-semibold text-gray-700">
                                  {item.quantity}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs uppercase tracking-wide text-gray-400">
                              Đơn giá
                            </p>
                            <p className="mt-1 text-xl font-bold text-green-600">
                              {Number(item.price).toLocaleString("vi-VN")} {currency}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ================= THÔNG TIN ================= */}
                <div className="col-span-3 text-[15px] space-y-2">
                  <p>
                    <span className="font-semibold">Số sản phẩm:</span>{" "}
                    {order.items.length}
                  </p>
                  <p>
                    <span className="font-semibold">Thanh toán:</span>{" "}
                    {order.paymentMethod === "Bank Transfer"
                      ? "Chuyển khoản"
                      : "Thanh toán khi nhận hàng"}
                  </p>
                  <p>
                    <span className="font-semibold">Trạng thái TT:</span>{" "}
                    {order.payment
                      ? "Đã thanh toán"
                      : order.paymentStatus || "Chưa thanh toán"}
                  </p>
                  <p>
                    <span className="font-semibold">Ngày đặt:</span>{" "}
                    {new Date(order.date).toLocaleDateString()}
                  </p>

                  {/* Nút xác nhận thanh toán (Chỉ hiện khi là Bank Transfer và chưa thanh toán) */}
                  {order.paymentMethod === "Bank Transfer" && !order.payment && (
                    <div className="pt-3">
                      <button
                        onClick={() => confirmBankPayment(order._id)}
                        className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition shadow"
                      >
                        XÁC NHẬN ĐÃ NHẬN TIỀN
                      </button>
                    </div>
                  )}
                </div>

                {/* ================= GIÁ TIỀN ================= */}
                <div className="col-span-2 flex flex-col justify-center bg-gray-50 rounded-xl p-4">
                  <p className="text-lg font-bold text-green-700">
                    {Number(order.amount).toLocaleString("vi-VN")} {currency}
                  </p>
                  <p className="text-gray-600 mt-2">
                    Tiền SP:{" "}
                    {Number(order.amount - 30000).toLocaleString("vi-VN")}{" "}
                    {currency}
                  </p>
                  <p className="text-gray-600">
                    Phí ship: 30.000 {currency}
                  </p>
                </div>

                {/* ================= TRẠNG THÁI ================= */}
                <div className="col-span-3 flex flex-col justify-between items-end">
                  <select
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                    className="border rounded-lg px-4 py-2 text-sm bg-white shadow"
                  >
                    <option value="Order Placed">📦 Đơn hàng đã đặt</option>
                    <option value="Packing">📦 Đang đóng gói</option>
                    <option value="Shipped">🚚 Đang vận chuyển</option>
                    <option value="Out for delivery">🚀 Đang giao hàng</option>
                    <option value="Delivered">✅ Đã giao</option>
                    <option value="Cancelled">❌ Đã hủy</option>
                  </select>

                  <div className="mt-6 text-right">
                    <p className="text-xs text-gray-500">Mã đơn hàng</p>
                    <p className="font-mono text-sm text-gray-700">
                      {order.orderCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl bg-white py-12 text-center shadow-sm">
            <p className="text-lg text-gray-500">
              {orders.length === 0
                ? "Không có đơn hàng nào."
                : "Không có đơn hàng nào trong khoảng thời gian đã chọn."}
            </p>

            {orders.length > 0 && (
              <button
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;