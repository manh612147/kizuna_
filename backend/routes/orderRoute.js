import express from "express";

import {
    allOrders,
    countOrders,
    getTotalRevenue,
    placeOrder,
    placeOrderBank,
    confirmBankPayment,
    updateStatus,
    userOrders,
    getRevenueByDay,
    getTotalImportCost,
    getProfit,
    getImportCostByOrder,
    getRevenueStats
} from "../controllers/orderController.js";

import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";
import upload from "../middleware/multer.js";


const orderRouter = express.Router();

// ================= ADMIN =================

// Lấy danh sách tất cả đơn hàng
orderRouter.post("/list", adminAuth, allOrders);

// Cập nhật trạng thái đơn hàng
orderRouter.post("/status", adminAuth, updateStatus);

// Admin xác nhận khách đã chuyển khoản
orderRouter.post(
    "/confirm-bank-payment",
    adminAuth,
    confirmBankPayment
);


// ================= ĐẶT HÀNG =================

// Thanh toán khi nhận hàng COD
orderRouter.post(
    "/place",
    authUser,
    placeOrder
);

// Chuyển khoản ngân hàng + upload ảnh minh chứng
orderRouter.post(
    "/bank",
    authUser,
    upload.single("paymentProof"),
    placeOrderBank
);


// ================= USER =================

// Lấy đơn hàng của người dùng
orderRouter.get(
    "/userorders/:userId",
    authUser,
    userOrders
);


// ================= THỐNG KÊ =================

orderRouter.get("/count", countOrders);

orderRouter.get("/total-revenue", getTotalRevenue);

orderRouter.get(
    "/total-import-cost",
    getTotalImportCost
);
orderRouter.get(
    "/revenue-stats",
    adminAuth,
    getRevenueStats
);
orderRouter.get(
    "/revenue-by-day",
    getRevenueByDay
);

orderRouter.get(
    "/profit",
    getProfit
);

orderRouter.get(
    "/import-cost/:orderId",
    getImportCostByOrder
);

export default orderRouter;