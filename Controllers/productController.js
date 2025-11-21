const Product = require("../Models/product");
const cloudinary = require("../config/cloudinary");

/* ========================================================
   GET ALL PRODUCTS (USER SPECIFIC)
======================================================== */
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
    });
  }
};

/* ========================================================
   PUBLIC PRODUCTS (HOME PAGE)
======================================================== */
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ========================================================
   GET PRODUCT BY ID
======================================================== */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    if (product.userId.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Error fetching product" });
  }
};

/* ========================================================
   CREATE PRODUCT
======================================================== */
const createProduct = async (req, res) => {
  try {
     console.log("PARAM ID:", req.params.id);
    console.log("USER FROM TOKEN:", req.user);
    console.log("RAW BODY RECEIVED:", req.body);
    console.log("FILE RECEIVED:", req.file);
    const {
      name,
      description,
      price,
      quantity,
      category,
      subCategory,
      sizes,
      colors,
    } = req.body;
    console.log()
    if (!name || !description || price == null || quantity == null) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const sizesArr =
      typeof sizes === "string" ? sizes.split(",").map((s) => s.trim()) : [];

    const colorsArr =
      typeof colors === "string" ? colors.split(",").map((c) => c.trim()) : [];

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity),
      category: category || "",
      subCategory: subCategory || "",
      sizes: sizesArr,
      colors: colorsArr,
      image: req.file ? req.file.path : "",
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Product created",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ success: false, message: "Error creating product" });
  }
};

/* ========================================================
   UPDATE PRODUCT
======================================================== */
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    if (product.userId.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    const {
      name,
      description,
      price,
      quantity,
      category,
      subCategory,
      sizes,
      colors,
    } = req.body;

    const updates = {};

    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (price !== undefined) updates.price = parseFloat(price);
    if (quantity !== undefined) updates.quantity = parseInt(quantity);
    if (category !== undefined) updates.category = category;
    if (subCategory !== undefined) updates.subCategory = subCategory;

    if (sizes !== undefined) {
      updates.sizes = sizes
        ? sizes.split(",").map((s) => s.trim())
        : [];
    }

    if (colors !== undefined) {
      updates.colors = colors
        ? colors.split(",").map((c) => c.trim())
        : [];
    }

    // Image update
    if (req.file) {
      updates.image = req.file.path;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: "Product updated",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: "Error updating product" });
  }
};

/* ========================================================
   DELETE PRODUCT
======================================================== */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    if (product.userId.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    if (product.image) {
      try {
        const publicId = product.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn("Image delete failed:", err.message);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
};
