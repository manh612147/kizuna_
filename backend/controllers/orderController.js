import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";
import  productModel from '../models/productModel.js'
import { v2 as cloudinary } from "cloudinary";

import mongoose from "mongoose";
import {sendOrderEmail,sendStatusEmail,sendCancelEmail} from "../config/mailService.js";


const generateOrderCode = () => {
    const now = new Date();

    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const random = Math.floor(1000 + Math.random() * 9000);

    return `KZ${year}${month}${day}${random}`;
};

const reduceStock = async (items) => {
    // Kiểm tra tồn kho trước
    for (const item of items) {
        const productId = item._id || item.productId || item.itemId;
        const quantity = Number(item.quantity);

        const product = await productModel.findById(productId);

        if (!product) {
            throw new Error(`Không tìm thấy sản phẩm ${item.name || ""}`);
        }

        if (product.stock < quantity) {
            throw new Error(
                `Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm`
            );
        }
    }

    // Sau khi tất cả đều đủ hàng thì mới trừ
    for (const item of items) {
        const productId = item._id || item.productId || item.itemId;
        const quantity = Number(item.quantity);

        const product = await productModel.findByIdAndUpdate(
            productId,
            {
                $inc: { stock: -quantity }
            },
            { new: true }
        );

        // Nếu hết hàng thì cập nhật trạng thái
        if (product.stock === 0) {
            product.status = "Hết hàng";
            await product.save();
        }
    }
};

// Đặt hàng bằng phương thức Thanh toán khi nhận hàng (COD)
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "ID không hợp lệ!"
            });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Không có sản phẩm trong đơn hàng!"
            });
        }

       
       // Kiểm tra tồn kho và tạo dữ liệu đơn hàng
const orderItems = [];

for (const item of items) {

    const productId = item._id || item.productId || item.itemId;

    const product = await productModel.findById(productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: `Không tìm thấy sản phẩm ${item.name || ""}`
        });
    }

    if (product.stock < Number(item.quantity)) {
        return res.status(400).json({
            success: false,
            message: `${product.name} chỉ còn ${product.stock} sản phẩm!`
        });
    }

    orderItems.push({
        productId: product._id,
        productCode: product.productCode, // Mã sản phẩm
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity
    });
}
        // Tạo đơn hàng
        const orderData = {
            userId,
            items: orderItems,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            status: "Order Placed",

            orderCode: generateOrderCode(),

            date: Date.now(),
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Đặt hàng COD thành công -> trừ tồn kho
        await reduceStock(items);

        // Xóa giỏ hàng
        await cartModel.findOneAndDelete({ userId });
        // Gửi email xác nhận
        await sendOrderEmail(
            address.email,
            `${address.firstName} ${address.lastName}`,
            items,
            amount,
            orderData.orderCode
        );
        res.json({
            success: true,
            message: "Đơn hàng đã được đặt thành công!"
        });

    } catch (error) {
        console.error("Lỗi khi đặt hàng COD:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Đặt hàng bằng chuyển khoản ngân hàng
const placeOrderBank = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        if (!userId || !items || items.length === 0 || !amount || !address) {
            return res.status(400).json({
                success: false,
                message: "Thiếu dữ liệu đặt hàng!"
            });
        }

        // Kiểm tra tồn kho và tạo dữ liệu đơn hàng
        const orderItems = [];

        for (const item of items) {
            const productId = item._id || item.productId || item.itemId;
            const product = await productModel.findById(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm!"
                });
            }

            if (product.stock < Number(item.quantity)) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} chỉ còn ${product.stock} sản phẩm!`
                });
            }

            orderItems.push({
                productId: product._id,
                productCode: product.productCode,
                name: product.name,
                image: product.image,
                price: product.price,
                quantity: item.quantity
            });
        }

        // Tạo đơn hàng (Bỏ paymentProof đi vì không còn upload ảnh)
        const newOrder = new orderModel({
            userId,
            items: orderItems,
            amount: Number(amount),
            address,
            orderCode: generateOrderCode(),
            paymentMethod: "Bank Transfer",
            payment: false,
            paymentStatus: "Chờ xác nhận", // Trạng thái nhắc Admin vào check tài khoản
            status: "Order Placed",
            date: Date.now()
        });

        await newOrder.save();

        // Đặt hàng thành công mới trừ kho
        await reduceStock(items);

        // Xóa giỏ hàng
        await cartModel.findOneAndDelete({ userId });
        
        // Gửi mail xác nhận
        await sendOrderEmail(
            address.email,
            `${address.firstName} ${address.lastName}`,
            items,
            amount,
            newOrder.orderCode
        );

        res.json({
            success: true,
            message: "Đặt hàng thành công! Đang chờ Admin xác nhận thanh toán."
        });

    } catch (error) {
        console.error("Lỗi đặt hàng chuyển khoản:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Admin xác nhận khách đã chuyển khoản
const confirmBankPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await orderModel.findByIdAndUpdate(
            orderId,
            {
                payment: true,
                paymentStatus: "Đã thanh toán"
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn hàng!"
            });
        }

        res.json({
            success: true,
            message: "Đã xác nhận thanh toán!"
        });

    } catch (error) {
        console.error("Lỗi xác nhận thanh toán:", error);

        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống!"
        });
    }
};
// Lấy tất cả đơn hàng cho bảng quản trị
const allOrders = async (req, res) => {
    try {
        
        const orders = await orderModel
            .find({})
            .sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.error("Lỗi khi lấy tất cả đơn hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

// Lấy danh sách đơn hàng của một người dùng cụ thể
const userOrders = async (req, res) => {
    try {
        const { userId } = req.params;

        const orders = await orderModel.find({ userId });
        
        res.json({ success: true, orders });
    } catch (error) {
        console.error("Lỗi khi lấy đơn hàng người dùng:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

// Cập nhật trạng thái đơn hàng từ bảng quản trị
const updateStatus = async (req, res) => {
    try {

        const { orderId, status, cancelReason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "ID đơn hàng không hợp lệ"
            });
        }

        // Lấy đơn hàng
        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn hàng"
            });
        }

        // Cập nhật trạng thái
       
        order.status = status;

        // Nếu hủy đơn thì lưu lý do và thời gian hủy
        if (status === "Cancelled") {
            order.cancelReason = cancelReason;
            order.cancelDate = new Date();
        }

        await order.save();

        // Gửi email cho khách
       await sendStatusEmail(
        order.address.email,
        `${order.address.firstName} ${order.address.lastName}`,
        status,
        order.items,
        order.amount,
        order.date,
        order.orderCode,
        order.cancelReason
    );

        res.json({
            success: true,
            message: "Trạng thái đơn hàng đã được cập nhật"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};
// Tính tổng số đơn hàng
const countOrders = async (req, res) => {
    try {
        const totalOrders = await orderModel.countDocuments();
        res.json({ success: true, totalOrders });
    } catch (error) {
        console.error("Lỗi khi đếm đơn hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

// Tính tổng doanh thu
const getTotalRevenue = async (req, res) => {
    try {
        const deliveryFee = 30000;

        const result = await orderModel.aggregate([
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: {
                            $subtract: ["$amount", deliveryFee]
                        }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            totalRevenue: result[0]?.total || 0
        });

    } catch (error) {
        console.error("Lỗi khi tính doanh thu:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};
// Tổng giá nhập hàng
const getTotalImportCost = async (req, res) => {
    try {
        const totalImportCost = await productModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalImportCost: {
                        $sum: { $multiply: ["$importPrice", "$stock"] } 
                    }
                }
            }
        ]);

        const total = totalImportCost.length > 0 ? totalImportCost[0].totalImportCost : 0;

        res.json({ success: true, totalImportCost: total });
    } catch (error) {
        console.error("Lỗi khi tính tổng giá nhập hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

// hàm tính tổng giá nhập của một đơn hàng
const getImportCostByOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: "ID đơn hàng không hợp lệ" });
        }

        const orderImportCost = await orderModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(orderId) } }, 
            { $unwind: "$items" },
            {
                $addFields: {
                    "items.productId": { $toObjectId: "$items.productId" } // Ép kiểu String -> ObjectId
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: "$_id",
                    totalImportCost: { 
                        $sum: { 
                            $multiply: [
                                { $ifNull: ["$productInfo.importPrice", 0] }, 
                                { $ifNull: ["$items.quantity", 0] }
                            ]
                        }
                    }
                }
            }
        ]);

        const totalImportCost = orderImportCost.length > 0 ? orderImportCost[0].totalImportCost : 0;

        res.json({ success: true, totalImportCost });
    } catch (error) {
        console.error("Lỗi khi tính tổng giá nhập đơn hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống!" });
    }
};

// lợi nhuận dòng
const getProfit = async (req, res) => {
    try {
        // Lấy tổng doanh thu
        const revenueResult = await orderModel.aggregate([
    {
        $group: {
            _id: null,
            total: {
                $sum: {
                    $subtract: ["$amount", 30000]
                }
            }
        }
    }
]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Lấy tổng giá nhập hàng
        const importCostResult = await productModel.aggregate([
            { $group: { _id: null, total: { $sum: { $multiply: ["$importPrice", "$quantity"] } } } }
        ]);
        const totalImportCost = importCostResult[0]?.total || 0;

        // Tính lợi nhuận
        const profit = totalRevenue - totalImportCost;

        res.json({ success: true, profit });
    } catch (error) {
        console.error("Lỗi khi tính lợi nhuận:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống!" });
    }
};

// 🛒 Thanh toán và cập nhật số lượng sản phẩm
const checkout = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "ID không hợp lệ!" });
        }

        const cart = await cartModel.findOne({ userId }).populate("items.itemId");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Giỏ hàng trống!" });
        }

        // Kiểm tra tồn kho
        for (let item of cart.items) {
            let product = await productModel.findById(item.itemId);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Sản phẩm ${product?.name || "không xác định"} không đủ hàng!` 
                });
            }
        }

        // Cập nhật số lượng tồn kho
        for (let item of cart.items) {
            debugger
            await productModel.findByIdAndUpdate(item.itemId, {
                $inc: { stock: -item.quantity }
            });
        }

        // Lấy danh sách sản phẩm mới sau khi cập nhật
        const updatedProducts = await productModel.find();

        // Xóa giỏ hàng sau khi thanh toán
        await cart.findOneAndDelete({ userId });

        res.json({ 
            success: true, 
            message: "Thanh toán thành công!", 
            products: updatedProducts  // Trả về danh sách sản phẩm mới
        });

    } catch (error) {
        console.error("🔥 Lỗi khi thanh toán:", error);
        res.status(500).json({ success: false, message: "Lỗi khi thanh toán!", error });
    }
};

// Hàm tính tổng giá nhập của sản phẩm
const getRevenueByDay = async (req, res) => {
    try {
        const revenueData = await orderModel.aggregate([
            {
                $match: { amount: { $gt: 0 }, createdAt: { $exists: true } } // Kiểm tra amount và createdAt
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalRevenue: {
    $sum: {
        $subtract: ["$amount", 30000]
    }
}
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({ success: true, revenueData });
    } catch (error) {
        console.error("🔥 Lỗi khi lấy doanh thu theo ngày:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống!" });
    }
};


// ================= THỐNG KÊ DOANH THU =================
const getRevenueStats = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;

        const match = {
            status: "Delivered"
        };

        // Lọc từ ngày
        if (fromDate) {
            match.createdAt = {
                ...match.createdAt,
                $gte: new Date(`${fromDate}T00:00:00+07:00`)
            };
        }

        // Lọc đến ngày
        if (toDate) {
            const endDate = new Date(`${toDate}T00:00:00+07:00`);
            endDate.setDate(endDate.getDate() + 1);

            match.createdAt = {
                ...match.createdAt,
                $lt: endDate
            };
        }

        const result = await orderModel.aggregate([
            { $match: match },

            // 1. Tách từng sản phẩm trong đơn để tính giá vốn
            { $unwind: "$items" },

            // 2. Chuyển productId thành ObjectId
            {
                $addFields: {
                    "items.productObjectId": {
                        $convert: {
                            input: "$items.productId",
                            to: "objectId",
                            onError: null,
                            onNull: null
                        }
                    }
                }
            },

            // 3. Lấy thông tin sản phẩm để lấy được importPrice (giá vốn)
            {
                $lookup: {
                    from: "products",
                    localField: "items.productObjectId",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            {
                $unwind: {
                    path: "$productInfo",
                    preserveNullAndEmptyArrays: true
                }
            },

            // 4. GOM LẠI THEO ĐƠN HÀNG TRƯỚC
            // (Bước này tính tổng giá vốn của đơn hàng và giữ lại trường amount)
            {
                $group: {
                    _id: "$_id",
                    orderAmount: { $first: "$amount" }, // Lấy tổng tiền thực tế khách trả
                    orderImportCost: {
                        $sum: {
                            $multiply: [
                                { $ifNull: ["$productInfo.importPrice", 0] },
                                { $ifNull: ["$items.quantity", 0] }
                            ]
                        }
                    }
                }
            },

            // 5. GOM TẤT CẢ LẠI ĐỂ RA SỐ TỔNG
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        // Doanh thu = Tổng hóa đơn - 30.000đ phí ship
                        $sum: { $subtract: ["$orderAmount", 30000] }
                    },
                    totalImportCost: { $sum: "$orderImportCost" }, // Tổng giá vốn
                    totalOrders: { $sum: 1 } // Tổng số đơn thành công
                }
            },

            // 6. TÍNH LỢI NHUẬN
            {
                $project: {
                    _id: 0,
                    totalRevenue: 1,
                    totalImportCost: 1,
                    totalOrders: 1,
                    profit: {
                        // Lợi nhuận = Doanh thu - Giá vốn
                        $subtract: ["$totalRevenue", "$totalImportCost"]
                    }
                }
            }
        ]);

        const stats = result[0] || {
            totalRevenue: 0,
            totalImportCost: 0,
            totalOrders: 0,
            profit: 0
        };

        res.json({
            success: true,
            ...stats
        });

    } catch (error) {
        console.error("Lỗi khi thống kê doanh thu:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi thống kê doanh thu"
        });
    }
};
export {
    getProfit,
    placeOrder,
    placeOrderBank,
    confirmBankPayment,
    allOrders,
    userOrders,
    updateStatus,
    countOrders,
    getTotalRevenue,
    checkout,
    getRevenueByDay,
    getTotalImportCost,
    getImportCostByOrder,
    getRevenueStats
};