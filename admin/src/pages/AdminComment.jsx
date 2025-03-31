import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminComments = () => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/comments/getallcomment");
      setComments(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bình luận:", error);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) return;

    try {
      await axios.delete(`http://localhost:4000/api/comments/${commentId}`);
      setComments(comments.filter(comment => comment._id !== commentId));
      toast.success("🗑️ Xóa bình luận thành công!");
    } catch (error) {
      toast.error("❌ Lỗi khi xóa bình luận");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">📢 Quản lý bình luận</h2>

      {comments.length === 0 ? (
        <p className="text-gray-500 text-center">📭 Không có bình luận nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="p-3 text-left">👤 Người dùng</th>
                <th className="p-3 text-left">💬 Bình luận</th>
                <th className="p-3 text-left">📦 ID Sản phẩm</th>
                <th className="p-3 text-center">⚙️ Hành động</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment._id} className="border-b hover:bg-gray-100 transition duration-200">
                  <td className="p-3">{comment.user}</td>
                  <td className="p-3">{comment.text}</td>
                  <td>
                      <div>{comment.productId?.productCode}</div>
                      <div className="text-xs text-gray-500">
                          {comment.productId?.name}
                      </div>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-200"
                    >
                       Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminComments;
