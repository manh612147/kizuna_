import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Tham chiếu đến người dùng (nếu có)
  },
  product: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    description: String,
    category: String,
    price: Number,
    bestseller: Boolean,
    stock: Number,
    discount: Number,
    status: String,
    image: [String],
  },
  addedAt: { type: Date, default: Date.now },
});

const Favorite = mongoose.model("Favorite", FavoriteSchema);
export default Favorite;
