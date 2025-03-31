import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaBox,
  FaUsers,
  FaShoppingCart,
  FaComment,
  FaRegListAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import axios from "axios";
import { backendUrl } from "../App";

const Sidebar = ({ token }) => {
  const [admin, setAdmin] = useState({ name: "Admin", avatar: "" });
  const navigate = useNavigate();

  return (
    <div className="w-[18%] min-h-screen bg-gray-900 text-white flex flex-col ">
      {/* Avatar & Admin Info */}
      <div
        className="flex flex-col items-center gap-2 py-6 border-b border-gray-700 cursor-pointer hover:bg-gray-800"
        onClick={() => navigate("/admin/dashboard")}
      >
        <img
          src={
            admin.avatar ||
            "https://www.shutterstock.com/image-vector/man-inscription-admin-icon-outline-600nw-1730974153.jpg"
          }
          alt="Admin Avatar"
          className="w-14 h-14 rounded-full border border-gray-500"
        />
        <p className="font-semibold">{admin.name}</p>
        <p className="text-sm text-gray-400">Chào mừng bạn trở lại!</p>
      </div>

      {/* Danh sách menu */}
      <div className="flex flex-col gap-2 pt-4 px-4">
        <SidebarItem to="/add" icon={<FaBox />} text="Thêm sản phẩm mới" />
        <SidebarItem
          to="/list"
          icon={<FaRegListAlt />}
          text="Danh sách sản phẩm"
        />
        <SidebarItem
          to="/order"
          icon={<FaShoppingCart />}
          text="Danh sách đơn hàng"
        />
        
        <SidebarItem
          to="/adminuser"
          icon={<FaUsers />}
          text="Danh sách người dùng"
        />
        
        <SidebarItem
          to="/admincomment"
          icon={<FaComment />}
          text="Danh sách bình luận"
        />
      </div>

    </div>
  );
};

const SidebarItem = ({ to, icon, text }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 p-3 rounded-lg transition ${
        isActive ? "bg-gray-700" : "hover:bg-gray-800"
      }`
    }
  >
    <span className="text-lg">{icon}</span>
    <span>{text}</span>
  </NavLink>
);

export default Sidebar;
