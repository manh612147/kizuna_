import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// Hàm thêm sản phẩm
const addProduct = async (req, res) => {
    try {
        const { name, productCode, description, price, importPrice, category, bestseller, stock, discount, status } = req.body;

        // Chỉ lấy 1 file ảnh duy nhất từ request
        const imageFile = req.file;

        let imagesUrl = [];
        if (imageFile) {
            let result = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            imagesUrl = [result.secure_url];
        }

        const productData = {
            name,
            productCode,
            description,
            category,
            price: Number(price),
            importPrice: Number(importPrice),
            bestseller: bestseller === "true",
            image: imagesUrl, 
            stock: Number(stock), 
            discount: Number(discount), 
            status: status || "Còn hàng", 
            date: Date.now(), 
        };

        const product = new productModel(productData);
        await product.save();

        res.json({ success: true, message: "Thêm sản phẩm thành công" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Hàm lấy danh sách sản phẩm
const listProducts = async (req, res) => {
    try {
        // Lấy tất cả sản phẩm từ database
        const products = await productModel.find({});
        res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Hàm xóa sản phẩm
const removeProduct = async (req, res) => {
    try {
        // Xóa sản phẩm theo ID được gửi từ request body
        await productModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Xóa thành công sản phẩm" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Hàm lấy thông tin chi tiết của một sản phẩm
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        // Tìm sản phẩm theo ID
        const product = await productModel.findById(productId);
        res.json({ success: true, product });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Hàm đếm tổng số sản phẩm
const countProducts = async (req, res) => {
    try {
        const totalProducts = await productModel.countDocuments(); 
        res.json({ success: true, total: totalProducts });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Hàm cập nhập thông tin sản phẩm 
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params; 
        // Bổ sung lấy thêm productCode từ req.body
        const { name, productCode, description, price, importPrice, category, bestseller, stock, discount, status } = req.body;

        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
        }

        // Tạo cục dữ liệu chữ để cập nhật
        const updateData = {
            name,
            productCode, 
            description,
            category,
            price: Number(price),
            importPrice: Number(importPrice),
            bestseller: bestseller === "true",
            stock: Number(stock),
            discount: Number(discount),
            status: status || "Còn hàng",
        };

        // KHI CÓ ẢNH MỚI: Xử lý upload lên Cloudinary
        // Multer có thể trả file về req.file hoặc req.files tùy cách cấu hình ở Route
        let imageFile = req.file || (req.files && req.files.image && req.files.image[0]);

        if (imageFile) {
            let result = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            updateData.image = [result.secure_url]; 
        }

        // Cập nhật vào Database
        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        res.json({ success: true, message: "Cập nhật sản phẩm thành công", product: updatedProduct });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
    }
};

export { listProducts, addProduct, removeProduct, singleProduct, countProducts, updateProduct };