import userModel from "../models/userModel.js";
import referralModel from "../models/referralModel.js";
import mongoose from "mongoose";

// Lấy danh sách tất cả người dùng
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password"); // Lấy tất cả user, ẩn password
    res.json({ success: true, users });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

// Lấy thông tin chi tiết một người dùng theo ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userModel.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại." });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

//xóa thông tin người dùng
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params; // Lấy userId từ URL

    // Kiểm tra userId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "UserId không hợp lệ." });
    }

    // Tìm người dùng trong database
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
    }

    // Xóa thông tin giới thiệu liên quan (nếu có)
    await referralModel.deleteMany({ $or: [{ referrerId: userId }, { referredUserId: userId }] });

    // Xóa người dùng
    await userModel.findByIdAndDelete(userId);

    res.json({ success: true, message: "Xóa người dùng thành công." });
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    // Log thêm thông tin chi tiết về lỗi nếu cần
    if (error.name === 'MongoError') {
      console.error("MongoDB Error:", error.message);
    }
    res.status(500).json({ success: false, message: "Lỗi server.", error: error.message });
  }
};



// Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    const user = await userModel.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại." });
    }
    res.json({ success: true, message: "Cập nhật thành công", user });
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

export { getAllUsers, getUserById, deleteUser, updateUser };
