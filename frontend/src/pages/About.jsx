import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/frontend_assets/assets";
import NewsletterBox from '../components/NewsletterBox';
import about from "../assets/frontend_assets/about.jpg";

const About = () => {
  return (
    <div>
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1={"VỀ"} text2={"CHÚNG TÔI"} />
      </div>
      <div className="my-10 flex flex-col md:flex-row gap-16">
        <img
  src={about}
  alt="About"
  className="w-full md:w-[450px] h-[550px] object-cover rounded-lg"
/>
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-600">
          <p>
            Chúng tôi cam kết mang đến những sản phẩm chất lượng cao và trải nghiệm mua sắm tốt nhất cho khách hàng.
          </p>
          <p>
            Với đội ngũ chuyên nghiệp, chúng tôi luôn cố gắng nâng cao chất lượng dịch vụ để đáp ứng mọi nhu cầu của bạn.
          </p>
          <b className="text-gray-800">Sứ mệnh của chúng tôi</b>
          <p>
            Chúng tôi hướng đến việc cung cấp những sản phẩm và dịch vụ tốt nhất, đảm bảo sự hài lòng tuyệt đối từ khách hàng.
          </p>
        </div>
      </div>
      <div className="text-xl py-4">
        <Title text1={"TẠI SAO"} text2={"CHỌN CHÚNG TÔI"} />
      </div>
      <div className="flex flex-col md:flex-row text-sm mb-20">
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Đảm bảo chất lượng</b>
          <p className="text-gray-600">Chúng tôi kiểm tra kỹ lưỡng từng sản phẩm để đảm bảo chất lượng tốt nhất.</p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Tiện lợi</b>
          <p className="text-gray-600">Trải nghiệm mua sắm dễ dàng, nhanh chóng với dịch vụ tận tâm.</p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Dịch vụ khách hàng tuyệt vời</b>
          <p className="text-gray-600">Chúng tôi luôn lắng nghe và hỗ trợ khách hàng một cách tận tình.</p>
        </div>
      </div>
      <NewsletterBox />
    </div>
  );
};

export default About;
