import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import Revenue from "./Revenue";

const AdminDashboard = ({ token }) => {
  const [admin, setAdmin] = useState({ name: "Admin", email: "", avatar: "" });
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/product/count`);
        if (response.data.success) {
          setTotalProducts(response.data.total);
        }
      } catch (error) {
        console.error("Lỗi khi lấy tổng số sản phẩm:", error);
      }
    };

    const fetchOrderCount = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/order/count`);
        if (response.data.success) {
          setTotalOrders(response.data.totalOrders);
        }
      } catch (error) {
        console.error("Lỗi khi lấy tổng số đơn hàng:", error);
      }
    };

    const fetchTotalRevenue = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/order/total-revenue`);
        if (response.data.success) {
          setTotalRevenue(response.data.totalRevenue);
        }
      } catch (error) {
        console.error("Lỗi khi lấy tổng doanh thu:", error);
      }
    };

    const fetchCustomerCount = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/customer/count`);
        if (response.data.success) {
          setTotalCustomers(response.data.totalCustomers);
        }
      } catch (error) {
        console.error("Lỗi khi lấy tổng số khách hàng:", error);
      }
    };

    if (token) {
      fetchProductCount();
      fetchOrderCount();
      fetchTotalRevenue();
      fetchCustomerCount();
    }
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-700">Trang quản trị hệ thống</h1>

      {/* Thông tin admin */}
      <div className="mt-6 flex gap-6 items-center">
        <img
          src={admin.avatar || "https://www.shutterstock.com/image-vector/man-inscription-admin-icon-outline-600nw-1730974153.jpg"}
          alt="Admin Avatar"
          className="w-24 h-24 rounded-full border border-gray-300"
        />
        <div>
          <p className="text-lg font-semibold">{admin.name}</p>
          <p className="text-gray-600">{admin.email}</p>
        </div>
      </div>

      {/* Thống kê hệ thống */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-700">Thống kê hệ thống:</h2>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          
          <div className="p-4 bg-white shadow-md rounded-lg flex flex-col items-center">
            <span className="text-4xl">📦</span>
            <p className="text-lg font-semibold mt-2">Tổng số sản phẩm</p>
            <p className="text-xl font-bold">{totalProducts}</p>
          </div>

          <div className="p-4 bg-white shadow-md rounded-lg flex flex-col items-center">
            <span className="text-4xl">📦</span>
            <p className="text-lg font-semibold mt-2">Số lượng đơn hàng</p>
            <p className="text-xl font-bold">{totalOrders}</p>
          </div>

          <div className="p-4 bg-white shadow-md rounded-lg flex flex-col items-center">
            <span className="text-4xl">👥</span>
            <p className="text-lg font-semibold mt-2">Tổng số khách hàng</p>
            <p className="text-xl font-bold">{totalCustomers}</p>
          </div>

        </div>
      </div>
      {/* Thêm Revenue vào Dashboard */}
      <div className="mt-6">
        <Revenue token={token} totalRevenue={totalRevenue} />
      </div>
      
    </div>
  );
};

export default AdminDashboard;