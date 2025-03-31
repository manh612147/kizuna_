import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminUserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:4000/api/user/userlist")
      .then(response => {
        setUsers(response.data.users);
      })
      .catch(error => {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
      });
  }, []);

  // Xóa người dùng
  const handleDeleteUser = async (userId) => {
    try {
      const response = await axios.delete(`http://localhost:4000/api/user/users/${userId}`);
      if (response.data.success) {
       toast.success("Xóa người dùng thành công!");
        setUsers(users.filter(user => user._id !== userId)); // Cập nhật lại danh sách
      }
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      toast.error('Lỗi khi xóa người dùng')
    }
  };
  

  // Sao chép mã giới thiệu
  const handleCopyReferralCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Đã sao chép mã giới thiệu!");
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">
        Danh sách người dùng
      </h2>

      {/* Bảng hiển thị trên màn hình từ tablet trở lên */}
      <div className="hidden sm:block overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <tr>
              <th className="px-4 py-3 border text-left">ID</th>
              <th className="px-4 py-3 border text-left">Tên</th>
              <th className="px-4 py-3 border text-left hidden md:table-cell">Email</th>
              <th className="px-4 py-3 border text-center hidden lg:table-cell">Điểm</th>
              <th className="px-4 py-3 border text-center hidden xl:table-cell">Mã OTP</th>
              <th className="px-4 py-3 border text-center">Mã Giới Thiệu</th>
              <th className="px-4 py-3 border text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="border hover:bg-gray-100 transition duration-200">
                <td className="px-4 py-3 border">{user._id}</td>
                <td className="px-4 py-3 border">{user.name}</td>
                <td className="px-4 py-3 border hidden md:table-cell">{user.email}</td>
                <td className="px-4 py-3 border text-center hidden lg:table-cell">{user.points}</td>
                <td className="px-4 py-3 border text-center hidden xl:table-cell">{user.resetOTP}</td>
                <td className="px-4 py-3 border text-center">
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded">{user.referralCode}</span>
                  <button
                    onClick={() => handleCopyReferralCode(user.referralCode)}
                    className="ml-2 text-blue-500 hover:text-blue-700 transition duration-200"
                  >
                    Copy
                  </button>
                </td>
                <td className="px-4 py-3 border text-center">
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="bg-red-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-red-600 transition duration-200"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hiển thị dạng thẻ trên màn hình nhỏ */}
      <div className="sm:hidden mt-4 space-y-4">
        {users.map(user => (
          <div key={user._id} className="bg-white shadow-md rounded-lg p-4 border">
            <p className="text-gray-800 font-semibold">ID: {user._id}</p>
            <p className="text-gray-600">Tên: {user.name}</p>
            <p className="text-gray-600">Email: {user.email}</p>
            <p className="text-gray-600">Điểm: {user.points}</p>
            <p className="text-gray-600">Mã OTP: {user.resetOTP}</p>
            <p className="text-gray-600">
              Mã Giới Thiệu: 
              <span className="bg-gray-200 px-2 py-1 rounded ml-1">{user.referralCode}</span>
              <button 
                onClick={() => handleCopyReferralCode(user.referralCode)}
                className="ml-2 text-blue-500 hover:text-blue-700 transition duration-200"
              >
                Copy
              </button>
            </p>
            <div className="mt-3 text-right">
              <button
                onClick={() => handleDeleteUser(user._id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUserList;