const Product = require("../Models/product");
const cloudinary = require("../config/cloudinary");


// so ek user id collection se ayegi aur dusri peoducts mese dono user id ko match nahi hauve toh na update karde denge na delete
/* ========================================================
   GET ALL PRODUCTS OF LOGGED-IN USER
======================================================== */
const getProducts = async (req, res) => {
  try {
    // Yaha productId USE nahi hoti
    // Hum sirf USER ID se products nikal rahe hai
    const products = await Product.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products, // Is data ke andar MongoDB AUTOMATIC productId (_id) bhej deta h
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
    // Yaha bhi productId use nahi hoti
    const products = await Product.find();

    res.json({
      success: true,
      count: products.length,
      data: products, // Mongo automatically _id bhej deta hai
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ========================================================
   GET PRODUCT BY ID  (Yaha PRODUCT ID use hota hai)
======================================================== */
const getProductById = async (req, res) => {
  try {
    // Yaha productId use hoti hai
    // req.params.id = product ka automatically generated _id
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    // Yaha userId use hota hai sirf CHECK karne ke liye
    // Ke ye product isi user ka hai ya nahi
    if (product.userId.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Error fetching product" });
  }
};

/* ========================================================
   CREATE PRODUCT  (Yaha PRODUCT ID auto create hota hai)
======================================================== */
const createProduct = async (req, res) => {
  try {
    // Input destructuring
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

    // Validate fields 
    if (!name || !description || price == null || quantity == null) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Convert sizes & colors to array
    const sizesArr =
      typeof sizes === "string" ? sizes.split(",").map((s) => s.trim()) : [];

    const colorsArr =
      typeof colors === "string" ? colors.split(",").map((c) => c.trim()) : [];

    // Yaha PRODUCT ID manually nahi dete
    // MongoDB automatically _id create karega
    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity),
      category: category || "",
      subCategory: subCategory || "",
      sizes: sizesArr,
      colors: colorsArr,
      image: "",
      userId: req.user.id,  // Yaha userId use hota hai product ko owner assign karne ke liye
    });

    // Agar file upload hai to image upload
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);

        product.image = result.secure_url;
        await product.save();
      } catch (uploadErr) {
        console.error("Cloudinary Upload Error:", uploadErr);

        // Yaha product._id use hota hai delete karne ke liye
        await Product.findByIdAndDelete(product._id);

        return res.status(500).json({
          success: false,
          message: "Image upload failed",
          error: uploadErr.message || uploadErr
        });
      }
    }

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
   UPDATE PRODUCT  (Yaha PRODUCT ID use hoti hai)
======================================================== */
const updateProduct = async (req, res) => {
  try {
    // PRODUCT ID use hoti hai
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    // USER ID check hota hai
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

    // Yaha update karte time productId use hota hai
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, // productId
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
   DELETE PRODUCT  (Yaha PRODUCT ID use hoti hai)
======================================================== */
const deleteProduct = async (req, res) => {
  try {
    // Pehle product find karne ke liye PRODUCT ID
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    // Fir userId check hota hai
    if (product.userId.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    // Agar image hai to cloudinary se delete
    if (product.image) {
      try {
        const publicId = product.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn("Image delete failed:", err.message);
      }
    }

    // Yaha PRODUCT ID Ekdum clearly use hoti hai delete karne ke liye
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

/* ========================================================
   HELPER: UPLOAD TO CLOUDINARY
======================================================== */
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};
