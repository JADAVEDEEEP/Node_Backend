const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
} = require("../Controllers/productController");
const auth = require("../Middleware/auth");


// All routes are protected with auth middleware
router.get('/allproducts',getAllProducts)
router.get("/", auth, getProducts);
router.get("/:id", auth, getProductById);
router.post("/", auth, createProduct);
router.put("/:id", auth, updateProduct);
router.delete("/:id", auth, deleteProduct);
 
module.exports = router;

// Frontend (Login Page)
//    ↓  (POST /login)
// Backend AuthRouter → Check DB → Generate Token → Send Token
//    ↓
// Frontend stores token → Redirects to Dashboard
//    ↓  (GET /products with Bearer Token)
// Backend Products Route
//    ↓
// auth.js Middleware → Verify Token → Add req.user.id
//    ↓
// productController.getProducts() → Fetch user’s products
//    ↓
// Send response (products)
//    ↓
// Frontend Dashboard → Display products
