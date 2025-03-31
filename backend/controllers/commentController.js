import Comment from "../models/commentModel.js";
import mongoose from "mongoose";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";

// Thêm bình luận mới
const addComment = async (req, res) => {
  try {

    const { productId } = req.params;

    let { userId, user, text, rating } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Product không hợp lệ"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "User không hợp lệ"
      });
    }

    // ==========================
    // KIỂM TRA ĐÃ MUA HÀNG CHƯA
    // ==========================

    const deliveredOrder = await orderModel.findOne({
    userId: userId.toString(),
    status: "Delivered",
    "items.productId": productId
});

    if (!deliveredOrder) {

      return res.status(403).json({

        success: false,

        message:
          "Bạn chỉ được đánh giá sau khi đơn hàng đã giao thành công."

      });

    }

    // ==========================
    // KHÔNG CHO ĐÁNH GIÁ 2 LẦN
    // ==========================

    const existed = await Comment.findOne({

      productId,

      userId

    });

    if (existed) {

      return res.status(400).json({

        success: false,

        message: "Bạn đã đánh giá sản phẩm này rồi."

      });

    }

    const newComment = new Comment({

      productId,

      userId,

      user,

      text,

      rating

    });

    await newComment.save();

    res.status(201).json({

      success: true,

      comment: newComment

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: error.message

    });

  }
};
  
// Lấy danh sách bình luận của một sản phẩm
const getComments = async (req, res) => {
  try {
    const { productId } = req.params;  // Lấy productId từ URL
    if (!productId) {
      return res.status(400).json({ message: "Thiếu productId!" });
    }
    const comments = await Comment.find({ productId }).sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bình luận:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

  

// Like một bình luận
const likeComment = async (req, res) => {
  try {
      const { commentId } = req.params;
      const comment = await Comment.findById(commentId);
      if (!comment) {
          return res.status(404).json({ message: "Không tìm thấy bình luận" });
      }

      comment.likes += 1; // Chỉ tăng số lượt like
      await comment.save();

      res.json({ success: true, likes: comment.likes });
  } catch (error) {
      res.status(500).json({ message: "Lỗi server" });
  }
}

// Chỉnh sửa bình luận
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { text },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Bình luận không tồn tại" });
    }
    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Xóa bình luận
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment) {
      return res.status(404).json({ message: "Bình luận không tồn tại" });
    }
    res.status(200).json({ message: "Xóa bình luận thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Admin lấy toàn bộ dữ liệu
const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find().populate(
    "productId",
    "productCode name"
); // Lấy tất cả bình luận
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách bình luận" });
  }
};


const getRatingSummary = async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await Comment.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(productId)
        }
      },
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (result.length === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0
      });
    }

    res.json({
      averageRating: Number(result[0].averageRating.toFixed(1)),
      totalReviews: result[0].totalReviews
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

export {
    likeComment,
    getComments,
    addComment,
    deleteComment,
    updateComment,
    getAllComments,
    getRatingSummary
}
