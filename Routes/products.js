const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../Controllers/productController");
const auth = require("../Middleware/auth");


// All routes are protected with auth middleware
router.get("/", auth, getProducts);
router.get("/:id", auth, getProductById);
router.post("/", auth, createProduct);
router.put("/:id", auth, updateProduct);
router.delete("/:id", auth, deleteProduct);

module.exports = router;
