import React from "react";
import { assets } from "../assets/frontend_assets/assets";

const Footer = () => {
  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap=14 my-10 mt-40 text-sm">
        <div>
          <img src={assets.logo} className="mb-5 w-32" />
          <p className="w-full md:w-2/3 text-gray-600">
            Chúng tôi cam kết mang đến những sản phẩm chất lượng nhất cho bạn.
            Luôn đổi mới, sáng tạo và phục vụ tận tâm để bạn có trải nghiệm mua sắm tốt nhất.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-medium mb-5">Liên kết nhanh</h3>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>Trang chủ</li>
            <li>Về chúng tôi</li>
            <li>Giao hàng</li>
            <li>Chính sách bảo mật</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-medium mb-5">LIÊN HỆ</h3>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>Điện thoại:0368510005</li>
            <li>Email: manh612147@gmail.com</li>
          </ul>
        </div>
      </div>
      <div>
        <hr />
        <p className="py-5 text-sm text-center">Cảm ơn quý khách</p>
      </div>
    </div>
  );
};

export default Footer;
