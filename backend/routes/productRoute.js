import express from "express";
import {addProduct,countProducts,listProducts,removeProduct,singleProduct,updateProduct} from "../controllers/productController.js";
import uplaod from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

// NÂNG CẤP: Dùng upload.single("image") cho cả tính năng Thêm và Sửa
productRouter.post("/add", adminAuth, uplaod.single("image"), addProduct);
productRouter.put("/update/:id", adminAuth, uplaod.single("image"), updateProduct);

productRouter.post("/remove",adminAuth, removeProduct);
productRouter.post("/single", singleProduct);
productRouter.get("/list", listProducts);
productRouter.get("/count", countProducts);

export default productRouter;