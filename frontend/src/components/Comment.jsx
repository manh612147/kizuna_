import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Comments = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState("");

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/comments/${productId}`);
      setComments(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy bình luận:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("❌ Nội dung bình luận không được để trống!");
      return;
    }
  
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("user");
  
    console.log("userId:", userId);
    console.log("userName:", userName);
  
    if (!userId || !userName) {
      toast.error("❌ Lỗi: Không tìm thấy thông tin người dùng!");
      return;
    }
  
    try {
      const response = await axios.post(`http://localhost:4000/api/comments/${productId}`, {
        userId: userId,
        user: userName,
        text: newComment,
        rating: rating,
      });
  
      toast.success("Thêm bình luận thành công!");
      setComments([...comments, response.data]);
      setNewComment("");
    } catch (error) {
      console.error("🚨 Lỗi khi thêm bình luận:", error.response?.data || error);
      toast.error("❌ Lỗi khi thêm bình luận");
    }
  };
  

  const handleDelete = async (commentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) return;

    try {
      await axios.delete(`http://localhost:4000/api/comments/${commentId}`);
      setComments(comments.filter(comment => comment._id !== commentId));
      toast.success("Xóa bình luận thành công!");
    } catch (error) {
      toast.error("Lỗi khi xóa bình luận");
    }
  };

  const handleEditClick = (commentId, text) => {
    setEditingCommentId(commentId);
    setEditedText(text);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editedText.trim()) {
      toast.error("❌ Nội dung bình luận không được để trống!");
      return;
    }

    try {
      const response = await axios.put(`http://localhost:4000/api/comments/${commentId}`, { text: editedText });

      setComments(comments.map(comment =>
        comment._id === commentId ? { ...comment, text: response.data.text } : comment
      ));

      toast.success("Cập nhật bình luận thành công!");
      setEditingCommentId(null);
    } catch (error) {
      toast.error("Lỗi khi cập nhật bình luận");
    }
  };

  const handleLike = async (commentId) => {
    try {
      const response = await axios.patch(`http://localhost:4000/api/comments/like/${commentId}`);
      setComments(comments.map(comment =>
        comment._id === commentId ? { ...comment, likes: response.data.likes } : comment
      ));
      toast.success("👍 Đã thích bình luận!");
    } catch (error) {
      console.error("Lỗi khi like bình luận:", error.response?.data || error);
      toast.error("Lỗi khi like bình luận");
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-3">Bình luận</h2>

      {/* Ô nhập bình luận */}
      <div className="mb-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Nhập bình luận..."
          className="border p-2 w-full rounded"
        />
        <div className="flex gap-2 mt-3 mb-3">
          {[1,2,3,4,5].map((star)=>(
              <span
                  key={star}
                  onClick={()=>setRating(star)}
                  className={`text-3xl cursor-pointer ${
                      star <= rating
                          ? "text-yellow-500"
                          : "text-gray-300"
                  }`}
              >
                  ★
              </span>
          ))}
      </div>
        <button onClick={handleAddComment} className="bg-blue-500 text-white p-2 rounded mt-2 w-full">
          Gửi
        </button>
      </div>

      {/* Danh sách bình luận */}
      {comments.map(comment => (
        <div key={comment._id} className="border p-4 my-2 rounded-lg">
          <p className="font-bold">{comment.user}:</p>

          {editingCommentId === comment._id ? (
            <input
              type="text"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="border p-2 w-full rounded"
            />
          ) : (
            <p>{comment.text}</p>
          )}

          <div className="flex items-center gap-2 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-xl ${
                    star <= comment.rating
                      ? "text-yellow-500"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            <span className="text-gray-600 text-sm">
              | Lượt thích: {comment.likes}
            </span>
          </div>

          <div className="flex gap-2 mt-2">
            <button onClick={() => handleLike(comment._id)} className="bg-green-500 text-white p-2 rounded">
              👍 Thích
            </button>

            {editingCommentId === comment._id ? (
              <button onClick={() => handleSaveEdit(comment._id)} className="bg-blue-500 text-white p-2 rounded">
                💾 Lưu
              </button>
            ) : (
              <button onClick={() => handleEditClick(comment._id, comment.text)} className="bg-yellow-500 text-white p-2 rounded">
                ✏️ Sửa
              </button>
            )}

            <button onClick={() => handleDelete(comment._id)} className="bg-red-500 text-white p-2 rounded">
              🗑️ Xóa
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Comments;
