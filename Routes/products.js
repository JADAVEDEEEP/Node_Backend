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

//FLOW SHOULD WORK LIKE THIS

// so when client send get reqst to the server
//  that get req handle by the get route and express will match the / get route and executed the first callback function who is the verfiy user based on the token if user as token it wikl be verfiyed and next callback function send that req to the controller were get product function will be or we can
//  say reqst handler function executed thr bussnes logic and find the products based on the spcefic user if prdocuts will be found there for it will send that product as rsponse to that user and client

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
