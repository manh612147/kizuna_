import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, 
  user: { type: String, required: true },
  text: { type: String, required: true },
  rating: { type: Number, default: 5 },
  likes: { type: Number, default: 0 }
}, { timestamps: true });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;

