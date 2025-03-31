import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
 import Sidebar from "./components/Sidebar";
import { Route, Routes } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Order from "./pages/Order";
import Login from "./components/Login";
import AdminDashboard from "./pages/AdminDashboard"; // Import trang admin
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminUserList from "./pages/AdminUserList";
import NewsletterList from "./pages/Newsletter";
import AdminComments from "./pages/AdminComment";
import Revenue from "./pages/Revenue";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = '₫';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    if (token) {
    localStorage.setItem("token", token); // Đảm bảo luôn lưu token mới nhất
  }
  }, [token]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <div>
          <Navbar setToken={setToken} />
          <hr />
          <div className="flex w-full">
            <Sidebar token={token} /> {/* Truyền token vào Sidebar */}
            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              <Routes>
                <Route path="/admin/dashboard" element={<AdminDashboard token={token} />} /> 
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/order" element={<Order token={token} />} />
                <Route path="/renenue" element={< Revenue token={token} />} />
                <Route path="/adminuser" element={ <AdminUserList token={token}/>}/>
                <Route path="/newsletter" element={ <NewsletterList token={token}/>}/>
                <Route path="/admincomment" element={ <AdminComments token={token}/>}/>
              </Routes>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
