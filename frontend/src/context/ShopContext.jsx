import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import axiosClient from '../apis/axiosClient'

export const ShopContext = createContext(); // Tạo context Shopcontext

const ShopContextProvider = (props) => {
  const currency = "₫";
  const delivery_fee = 30000;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Lấy giỏ hàng từ localStorage khi khởi động nếu không có DL thì rỗng
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : {};
  });

  const [products, setProducts] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();

  // Lấy dữ liệu giỏ hàng từ backend
const getProductInCart = async()=> {
  if(!token) return 
  const userId = localStorage.getItem("userId");

  if (!userId) {
    console.warn("Không tìm thấy userId trong localStorage");
    return;
  }

  await axiosClient.get(`/api/cart/${userId}`)
  .then((res)=> {
    setCartItems(res.data.cartData || []);
    localStorage.setItem("cartItems", JSON.stringify(res.data.cartData || []));
  })
  .catch((error)=> {
    console.error('Get Cart data error >>>>', error?.message);
    setCartItems([]);
  })
}
  
  // 🛍️ Thêm sản phẩm vào giỏ hàng
 
const addToCart = async (itemId, stock) => {
  if (stock === 0) {
    toast.error("Sản phẩm đã hết hàng!");
    return;
  }

  if (!token) {
    toast.warning("Vui lòng đăng nhập.");
    return;
  }

  try {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      toast.error("Không tìm thấy tài khoản.");
      return;
    }

    const response = await axios.post(
      `${backendUrl}/api/cart/add`,
      {
        userId,
        itemId,
        quantity: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      toast.success("Đã thêm vào giỏ hàng!");
      await getProductInCart();
    } else {
      toast.error(response.data.message);
    }
  } catch (error) {
    console.error("ADD CART ERROR:", error.response?.data || error.message);
    toast.error("Không thể thêm vào giỏ hàng!");
  }
};
  
  // 📌 Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateQuantity = async (itemId, quantity) => {
  if (quantity < 0) {
    toast.error("Số lượng không hợp lệ!");
    return;
  }

  if (!token) {
    toast.warning("Vui lòng đăng nhập.");
    return;
  }

  try {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      toast.error("Không tìm thấy tài khoản.");
      return;
    }

    const response = await axios.post(
      `${backendUrl}/api/cart/update`,
      {
        userId,
        itemId,
        quantity,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      await getProductInCart();
      toast.success("Cập nhật giỏ hàng thành công!");
    } else {
      toast.error(response.data.message);
    }
  } catch (error) {
    console.error(
      "UPDATE CART ERROR:",
      error.response?.status,
      error.response?.data
    );

    toast.error(
      error.response?.data?.message || "Lỗi khi cập nhật giỏ hàng!"
    );
  }
};


const getFavoriteProducts = async () => {
  const userId = localStorage.getItem("userId");

  if (!userId) return;

  try {
    const response = await axios.get(
      `${backendUrl}/api/favorites/${userId}`
    );

    if (response.data.favorites) {
      setFavoriteIds(
        response.data.favorites.map(item => item.product._id)
      );
    }
  } catch (err) {
    console.log(err);
  }
};
  // 🛒 Tính tổng số lượng sản phẩm trong giỏ hàng
  const getCartCount = () => {
    return cartItems?.length || 0
  };
  
  // 💰 Tính tổng giá trị giỏ hàng
const getCartAmount = () => {
  if (!Array.isArray(cartItems)) {
    return 0;
  }

  return cartItems.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const discount = Number(item.discount) || 0;
    const quantity = Number(item.quantity) || 0;

    const finalPrice = Math.round(
      price * (1 - discount / 100)
    );

    return total + finalPrice * quantity;
  }, 0);
};
  
  // 📦 Lấy danh sách sản phẩm từ API
  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi lấy sản phẩm!");
    }
  };

  // 🚀 Load sản phẩm khi khởi chạy
  useEffect(() => {
    getProductsData();
  }, []);

  // 🔄 Lấy lại giỏ hàng khi có token mới
 useEffect(() => {
    if (token) {
        getProductInCart();
        getFavoriteProducts();
    }
}, [token]);

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setCartItems({});
    localStorage.removeItem("cartItems");
    toast.success("Đăng xuất thành công!");
    navigate("/login");
  };

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    setToken,
    token,
    logout,
    favoriteIds,
    setFavoriteIds,
    getFavoriteProducts,
  };


  return <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>;
};

export default ShopContextProvider;