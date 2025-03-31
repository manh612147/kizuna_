import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productCode: {
  type: String,
  required: true,
  unique: true,
  trim: true,
},
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  importPrice:{ type: Number, required: true } ,
  bestseller: { type: Boolean, default: false },
  stock: { type: Number, required: true, min: 0 }, // Số lượng trong kho (>= 0)
  discount: { type: Number, default: 0, min: 0, max: 100 }, // Giảm giá %
  status: { type: String, enum: ["Còn hàng", "Hết hàng"] }, // Trạng thái
  image: { type: [String], default: [] }, // Danh sách URL ảnh
  date: { type: Date, default: Date.now },
});

// Middleware tự động cập nhật trạng thái dựa trên stock
productSchema.pre("save", function (next) {
    this.status = this.stock > 0 ? "Còn hàng" : "Hết hàng";
    next();
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;


