import userModel from "../models/userModel.js";
import Cart from "../models/cartModel.js";
import mongoose from "mongoose";
import productModel from "../models/productModel.js";

// 🛒 Thêm sản phẩm vào giỏ hàng
const addToCart = async (req, res) => {
    try {
        const { userId, itemId, quantity = 1 } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(userId) ||
            !mongoose.Types.ObjectId.isValid(itemId)
        ) {
            return res.status(400).json({
                success: false,
                message: "ID không hợp lệ!"
            });
        }

        // Lấy sản phẩm để kiểm tra tồn kho
        const product = await productModel.findById(itemId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm!"
            });
        }

        if (product.stock <= 0) {
            return res.status(400).json({
                success: false,
                message: "Sản phẩm đã hết hàng!"
            });
        }

        const objectId = new mongoose.Types.ObjectId(userId);
        let cart = await Cart.findOne({ userId: objectId });

        if (!cart) {
            // Kiểm tra số lượng thêm mới
            if (quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm chỉ còn ${product.stock} sản phẩm trong kho!`
                });
            }

            cart = new Cart({
                userId: objectId,
                items: [
                    {
                        itemId: new mongoose.Types.ObjectId(itemId),
                        quantity
                    }
                ]
            });

        } else {
            const existingItem = cart.items.find(
                (item) => item.itemId.toString() === itemId
            );

            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;

                // Không cho tổng số lượng vượt tồn kho
                if (newQuantity > product.stock) {
                    return res.status(400).json({
                        success: false,
                        message: `Bạn chỉ có thể mua tối đa ${product.stock} sản phẩm!`
                    });
                }

                existingItem.quantity = newQuantity;

            } else {
                if (quantity > product.stock) {
                    return res.status(400).json({
                        success: false,
                        message: `Sản phẩm chỉ còn ${product.stock} sản phẩm trong kho!`
                    });
                }

                cart.items.push({
                    itemId: new mongoose.Types.ObjectId(itemId),
                    quantity
                });
            }
        }

        await cart.save();

        res.json({
            success: true,
            message: "Thêm sản phẩm vào giỏ hàng thành công!",
            cart
        });

    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);

        res.status(500).json({
            success: false,
            message: "Lỗi khi thêm sản phẩm vào giỏ hàng!"
        });
    }
};

// ✏️ Cập nhật số lượng sản phẩm trong giỏ hàng
const updateCart = async (req, res) => {
    try {
        const { userId, itemId, quantity } = req.body;
        const newQuantity = Number(quantity);

        console.log("UPDATE CART:", {
            userId,
            itemId,
            quantity: newQuantity
        });

        // Kiểm tra ID
        if (
            !mongoose.Types.ObjectId.isValid(userId) ||
            !mongoose.Types.ObjectId.isValid(itemId)
        ) {
            return res.status(400).json({
                success: false,
                message: "ID không hợp lệ!"
            });
        }

        // Lấy sản phẩm trực tiếp từ database
        const product = await productModel.findById(itemId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm!"
            });
        }

        console.log("TỒN KHO:", product.stock);
        console.log("SỐ LƯỢNG MUỐN MUA:", newQuantity);

        // CHẶN VƯỢT QUÁ TỒN KHO
        if (newQuantity > Number(product.stock)) {
            return res.status(400).json({
                success: false,
                message: `Sản phẩm chỉ còn ${product.stock} sản phẩm trong kho!`
            });
        }

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giỏ hàng!"
            });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.itemId.toString() === itemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm trong giỏ hàng!"
            });
        }

        if (newQuantity > 0) {
            cart.items[itemIndex].quantity = newQuantity;
        } else {
            cart.items.splice(itemIndex, 1);
        }

        await cart.save();

        return res.json({
            success: true,
            message: "Cập nhật giỏ hàng thành công!",
            cart
        });

    } catch (error) {
        console.error("UPDATE CART ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật giỏ hàng!"
        });
    }
};
// 📦 Lấy giỏ hàng của người dùng
const getUserCart = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "userId không hợp lệ!" });
        }

        const cart = await Cart.findOne({ userId }).populate("items.itemId");

        if (!cart) {
            return res.status(200).json({ success: true, cartData: [] });
        }

        let newCartData = [];

        for (let item of cart.items) {
            const productData = await productModel.findOne({ _id: item.itemId });

            if (productData) {
                newCartData.push({
                    _id: productData._id,
                    name: productData.name,
                    description: productData.description,
                    price: productData.price,
                    image: productData.image,
                    category: productData.category,
                    
                    bestseller: productData.bestseller,
                    date: productData.date,
                    discount: productData.discount,
                    stock: productData.stock,
                    quantity: item.quantity,
                });
            }
        }

        res.json({ success: true, cartData: newCartData });

    } catch (error) {
        console.error("🔥 Lỗi khi lấy giỏ hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi khi lấy giỏ hàng!", error });
    }
};

  // ❌ Xóa toàn bộ giỏ hàng của người dùng
const clearCart = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "ID người dùng không hợp lệ!" });
        }

        const cart = await Cart.findOneAndDelete({ userId });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Không tìm thấy giỏ hàng!" });
        }

        res.json({ success: true, message: "Giỏ hàng đã được xóa!" });

    } catch (error) {
        console.error("🔥 Lỗi khi xóa giỏ hàng:", error);
        res.status(500).json({ success: false, message: "Lỗi khi xóa giỏ hàng!", error });
    }
};
  
export { addToCart, updateCart, getUserCart, clearCart};
