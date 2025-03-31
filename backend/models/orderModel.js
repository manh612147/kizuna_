import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  orderCode: {
  type: String,
  required: true,
  unique: true
},

  items: {
    type: Array,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  address: {
    type: Object,
    required: true
  },

  status: {
    type: String,
    default: "Order Placed"
  },
  cancelReason: {
  type: String,
  default: ""
  },

  cancelDate: {
    type: Date,
    default: null
  },
  paymentMethod: {
    type: String,
    required: true
  },

  payment: {
    type: Boolean,
    default: false
  },

  // Ảnh biên lai chuyển khoản
  paymentProof: {
    type: String,
    default: ""
  },

  // Trạng thái xác nhận thanh toán
  paymentStatus: {
    type: String,
    enum: [
      "Chưa thanh toán",
      "Chờ xác nhận",
      "Đã thanh toán"
    ],
    default: "Chưa thanh toán"
  },
  orderCode: {
  type: String,
  default: ""
},
  date: {
    type: Number,
    default: Date.now
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const orderModel =
  mongoose.models.order ||
  mongoose.model("order", orderSchema);

export default orderModel;