import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const LatestCollection = () => {
  const { products, favoriteIds } = useContext(ShopContext);
  // console.log(products);

  const [latestProduct, setLatestProducts] = useState([]);

 useEffect(() => {
  const latest = [...products]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  setLatestProducts(latest);
}, [products]);
  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1={"BỘ SƯU TẬP"} text2={"MỚI NHẤT"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Khám phá những sản phẩm mới nhất của chúng tôi với chất lượng cao,
          thiết kế tinh tế và phong cách hiện đại.
          Mỗi sản phẩm đều được chọn lọc kỹ lưỡng để mang lại trải nghiệm mua sắm tốt nhất cho bạn.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {latestProduct.map((item, index) => (
          <ProductItem
            key={index}
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

export default LatestCollection;
