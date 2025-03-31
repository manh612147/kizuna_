import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // ================= TÌM KIẾM & LỌC =================
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Lấy danh sách sản phẩm từ API
  const fetchList = async () => {
    try {
      const response = await axios.get(
        backendUrl + "/api/product/list"
      );

      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // ================= LỌC SẢN PHẨM =================
  const filteredList = list.filter((item) => {
    const keyword = searchTerm.toLowerCase().trim();

    const matchSearch =
      item.name?.toLowerCase().includes(keyword) ||
      item.productCode?.toLowerCase().includes(keyword);

    const matchCategory =
      selectedCategory === "all" ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchSearch && matchCategory;
  });

  // Xóa sản phẩm
  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Bắt đầu chỉnh sửa
  const startEditing = (item) => {
    setEditingId(item._id);
    setEditData({ ...item });
  };

  // Cập nhật giá trị khi chỉnh sửa
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "size") {
      setEditData({
        ...editData,
        size: value.split(","),
      });
    } else {
      setEditData({
        ...editData,
        [name]: value,
      });
    }
  };

  // Lưu chỉnh sửa
  const saveEdit = async () => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/product/update/${editingId}`,
        editData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Cập nhật sản phẩm thành công");
        setEditingId(null);
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi xảy ra khi cập nhật sản phẩm");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div>

      <p className="mb-3">
        Danh sách tất cả sản phẩm
      </p>

      {/* ================= TÌM KIẾM + LỌC ================= */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">

        {/* Ô tìm kiếm */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Tìm theo tên hoặc mã sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500"
          />
        </div>

        {/* Lọc danh mục */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="md:w-52 border border-gray-300 rounded-lg px-4 py-2.5 bg-white outline-none focus:border-blue-500"
        >
          <option value="all">
            Tất cả danh mục
          </option>

          <option value="gaubong">
            Gấu bông
          </option>

          <option value="mockhoa">
            Móc khóa
          </option>

          <option value="vongtay">
            Vòng tay
          </option>

          <option value="hoa">
            Hoa
          </option>
        </select>

        {/* Xóa bộ lọc */}
        {(searchTerm || selectedCategory !== "all") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
            }}
            className="px-4 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Xóa lọc
          </button>
        )}

      </div>

      {/* Số lượng kết quả */}
      <p className="text-sm text-gray-500 mb-2">
        Hiển thị {filteredList.length} / {list.length} sản phẩm
      </p>

      <div className="flex flex-col gap-2">

        {/* Tiêu đề bảng danh sách */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Hình ảnh</b>
          <b>Tên</b>
          <b>Mã sản phẩm</b>
          <b>Danh mục</b>
          <b>Giá bán</b>
          <b>Giá nhập</b>
          <b>Số lượng</b>
          <b className="text-center">Hành động</b>
        </div>

        {/* Danh sách sản phẩm */}
        {filteredList.map((item, index) => (
          <div
            key={item._id}
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
          >
            <img
              className="w-12"
              src={item.image[0]}
              alt={item.name}
            />

            <p>{item.name}</p>

            <p>{item.productCode}</p>

            <p>{item.category}</p>

            <p>
              {Number(item.price).toLocaleString("vi-VN")} {currency}
            </p>

            <p className="text-blue-600 font-medium">
              {Number(item.importPrice || 0).toLocaleString("vi-VN")} {currency}
            </p>

            <p>{item.stock}</p>

            <div className="flex gap-2">
              <button
                onClick={() => startEditing(item)}
                className="text-blue-500"
              >
                Edit
              </button>

              <p
                onClick={() => removeProduct(item._id)}
                className="text-right md:text-center cursor-pointer text-lg text-red-500"
              >
                X
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form Chỉnh Sửa */}
      {editingId && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg w-1/3">
            <h2 className="text-lg font-bold mb-3">Chỉnh sửa sản phẩm</h2>

            <div className="flex flex-col gap-2">
              <label>Tên sản phẩm:</label>
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              <label>Danh mục:</label>
              <input
                type="text"
                name="category"
                value={editData.category}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              <label>Giá:</label>
              <input
                type="number"
                name="price"
                value={editData.price}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <label>Giá nhập:</label>
              <input
              type="number"
              name="importPrice"
              value={editData.importPrice}
              onChange={handleChange}
              className="border p-2 rounded"
              />
              <label>Số lượng:</label>
              <input
                type="number"
                name="stock"
                value={editData.stock}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              <label>Giảm giá (%):</label>
              <input
                type="number"
                name="discount"
                value={editData.discount}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditingId(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Hủy
              </button>
              <button
                onClick={saveEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;
