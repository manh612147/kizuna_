import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [imageFile, setImageFile] = useState(null); // State mới để lưu file ảnh khi sửa

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
    setImageFile(null); // Reset file ảnh mỗi khi mở form sửa sản phẩm khác
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

  // Lưu chỉnh sửa (Đã nâng cấp để hỗ trợ gửi File Ảnh)
  const saveEdit = async () => {
    try {
      // Vì có chứa file ảnh, ta phải dùng FormData thay vì JSON thông thường
      const formData = new FormData();
      
      // Đưa các thông tin chữ vào formData
      Object.keys(editData).forEach((key) => {
        // Không gửi lại mảng ảnh cũ hoặc _id qua formData text
        if (key !== "image" && key !== "_id") {
          formData.append(key, editData[key]);
        }
      });

      // Nếu có chọn ảnh mới thì nhét vào formData
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await axios.put(
        `${backendUrl}/api/product/update/${editingId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Khi dùng FormData, Axios sẽ tự động set header "multipart/form-data"
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
          <option value="all">Tất cả danh mục</option>
          <option value="gaubong">Gấu bông</option>
          <option value="mockhoa">Móc khóa</option>
          <option value="vongtay">Vòng tay</option>
          <option value="hoa">Hoa</option>
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
              className="w-12 h-12 object-cover rounded"
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

            <div className="flex justify-center gap-2">
              <button
                onClick={() => startEditing(item)}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                Edit
              </button>
              <p
                onClick={() => removeProduct(item._id)}
                className="cursor-pointer text-lg text-red-500 hover:text-red-700 font-bold ml-2"
              >
                X
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form Chỉnh Sửa */}
      {editingId && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 md:w-1/3 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Chỉnh sửa sản phẩm</h2>

            <div className="flex flex-col gap-3">
              
              {/* Thêm ô đổi hình ảnh */}
              <div className="flex flex-col">
                <label className="font-medium text-gray-700">Hình ảnh mới (bỏ trống nếu không đổi):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="border p-2 rounded mt-1"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-gray-700">Tên sản phẩm:</label>
                <input
                  type="text"
                  name="name"
                  value={editData.name || ""}
                  onChange={handleChange}
                  className="border p-2 rounded mt-1"
                />
              </div>

              {/* Thêm ô Mã sản phẩm */}
              <div className="flex flex-col">
                <label className="font-medium text-gray-700">Mã sản phẩm:</label>
                <input
                  type="text"
                  name="productCode"
                  value={editData.productCode || ""}
                  onChange={handleChange}
                  className="border p-2 rounded mt-1"
                />
              </div>

              {/* Đổi Danh mục sang dạng Select Dropdown */}
              <div className="flex flex-col">
                <label className="font-medium text-gray-700">Danh mục:</label>
                <select
                  name="category"
                  value={editData.category || "gaubong"}
                  onChange={handleChange}
                  className="border p-2 rounded mt-1 bg-white"
                >
                  <option value="gaubong">Gấu bông</option>
                  <option value="mockhoa">Móc khóa</option>
                  <option value="vongtay">Vòng tay</option>
                  <option value="hoa">Hoa</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700">Giá bán:</label>
                  <input
                    type="number"
                    name="price"
                    value={editData.price || ""}
                    onChange={handleChange}
                    className="border p-2 rounded mt-1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700">Giá nhập:</label>
                  <input
                    type="number"
                    name="importPrice"
                    value={editData.importPrice || ""}
                    onChange={handleChange}
                    className="border p-2 rounded mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700">Số lượng:</label>
                  <input
                    type="number"
                    name="stock"
                    value={editData.stock || ""}
                    onChange={handleChange}
                    className="border p-2 rounded mt-1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700">Giảm giá (%):</label>
                  <input
                    type="number"
                    name="discount"
                    value={editData.discount || ""}
                    onChange={handleChange}
                    className="border p-2 rounded mt-1"
                  />
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingId(null)}
                className="bg-gray-400 hover:bg-gray-500 text-white font-medium px-5 py-2 rounded transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={saveEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded transition-colors"
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