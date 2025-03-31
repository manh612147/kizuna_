import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const CartTotal = () => {
    const { currency, delivery_fee, getCartAmount } = useContext(ShopContext);

    const cartAmount = getCartAmount();
    const totalAmount = cartAmount === 0 ? 0 : cartAmount + delivery_fee;

    return (
        <div className='w-full'>
            <div className='text-2xl'>
                <Title text1={'TỔNG'} text2={'GIỎ HÀNG'} />
            </div>

            <div className='flex flex-col gap-2 mt-2 text-sm'>
                <div className='flex justify-between'>
                    <p>Tạm tính</p>
                    <p>{cartAmount.toLocaleString("vi-VN")} {currency}</p>
                </div>

                <hr />

                <div className='flex justify-between'>
                    <p>Phí vận chuyển</p>
                    <p>{delivery_fee.toLocaleString("vi-VN")} {currency}</p>
                </div>

                <hr />

                <div className='flex justify-between'>
                    <p>Tổng cộng</p>
                    <p>{totalAmount.toLocaleString("vi-VN")} {currency}</p>
                </div>
            </div>
        </div>
    );
};

export default CartTotal;