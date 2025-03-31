import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const BestSeller = () => {
  const { products, favoriteIds } = useContext(ShopContext);
  const [discountedProducts, setDiscountedProducts] = useState([]);

  useEffect(() => {
    // Lấy những sản phẩm đang có giảm giá
    const discountProducts = products
      .filter((item) => Number(item.discount) > 0)
      // Sản phẩm giảm nhiều nhất xếp trước
      .sort((a, b) => Number(b.discount) - Number(a.discount));

    setDiscountedProducts(discountProducts.slice(0, 20));
  }, [products]);

  return (
    <div className="my-10">
      <div className="text-center text-3xl py-8">

        <Title
          text1={"SẢN PHẨM"}
          text2={"ĐANG GIẢM GIÁ"}
        />

        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Những sản phẩm đang được giảm giá với mức ưu đãi hấp dẫn tại
          Kizuna Handmade.
        </p>

      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">

        {discountedProducts.map((item, index) => (
          <ProductItem
            key={item._id}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
            stock={item.stock}
            discount={item.discount}
            isFavorite={favoriteIds.includes(item._id)}
          />
        ))}

      </div>
    </div>
  );
};

export default BestSeller;