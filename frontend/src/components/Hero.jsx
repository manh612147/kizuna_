import React from "react";
import { assets } from '../assets/frontend_assets/assets';
import hero_img from "../assets/frontend_assets/hero_img.jpg";

const Hero = () => {
  return (
    <div className="flex flex-col sm:flex-row border border-gray-400">
      <div className="w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0">
        <div className="text-[#414141]">
          <div className="flex items-center gap-2">
            <p className="w-8 md:w-11 h-[2px] bg-[#414141]"></p>
            <p className="font-medium text-sm md:text-base">SẢN PHẨM BÁN CHẠY</p>
          </div>
          <h1 className="prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed">
            HÀNG MỚI VỀ
          </h1>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm md:text-base">MUA NGAY</p>
            <p className="w-8 md:w-11 h-[2px] bg-[#414141]"></p>
          </div>
        </div>
      </div>
      <img
  className="w-full sm:w-1/2 h-[250px] sm:h-[400px] object-cover"
  src={hero_img}
  alt="Hero"
/>
    </div>
  );
};

export default Hero;
