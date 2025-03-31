import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/frontend_assets/assets'
import NewsletterBox from '../components/NewsletterBox'
import contact from "../assets/frontend_assets/contact.jpg";

const Contact = () => {
  return (
    <div>
      {/* Tiêu đề trang */}
      <div className="text-center text-2xl pt-10 border-t">
        <Title text1={'LIÊN HỆ'} text2={'VỚI CHÚNG TÔI'} />
      </div>

      {/* Nội dung liên hệ */}
      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28">
        {/* Hình ảnh liên hệ */}
        <img
  className="w-full md:w-[450px] h-[500px] object-cover rounded-lg"
  src={contact}
  alt="Liên hệ chúng tôi"
/>

        {/* Thông tin liên hệ */}
        <div className="flex flex-col justify-center items-start gap-6">
          <p className="font-semibold text-xl text-gray-600">Cửa Hàng Của Chúng Tôi</p>
          <p className="text-gray-500">
            347 cổ nhuế 2 <br /> Đông Ngạc , Hà Nội
          </p>
          <p className="text-gray-500">
            SĐT: 0368510005 <br /> Email: manh612147@gmail.com
          </p>
          <p className="font-semibold text-gray-500">Cơ Hội Nghề Nghiệp</p>
          <p className="text-gray-500">
            Tìm hiểu thêm về đội ngũ của chúng tôi và các vị trí tuyển dụng.
          </p>
          <button className="border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500">
            Khám Phá Việc Làm
          </button>
        </div>
      </div>

      {/* Hộp đăng ký nhận tin */}
      <NewsletterBox />
    </div>
  )
}

export default Contact
