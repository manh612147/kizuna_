import React from 'react'
import {assets} from "../assets/admin_assets/assets.js"

const Navbar = ({setToken}) => {
  return (
    <div className='flex items-center py-3 pl-4 sm:pl-4 pr-[4%] justify-between bg-white border-b border-gray-200 shadow-sm'>
      
      {/* LOGO */}
      <img 
        className='w-28 sm:w-36 h-14 sm:h-16 object-contain mix-blend-multiply cursor-pointer hover:scale-105 transition-transform duration-300' 
        src={assets.logo} 
        alt="Logo Kizuna" 
      />
      
      {/* NÚT ĐĂNG XUẤT */}
      <button 
        onClick={() => setToken('')} 
        className='bg-gray-700 hover:bg-gray-900 text-white px-6 py-2 sm:px-8 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg'
      >
        Đăng xuất
      </button>
      
    </div>
  )
}

export default Navbar