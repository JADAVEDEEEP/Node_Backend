const Product = require('../Models/product');

/*
req.user.id
– This contains the ID of the currently logged-in user (usually added by your authentication middleware after verifying the JWT token).

Product.find({ userId: req.user.id })
– This tells MongoDB to find only the products that belong to that specific user.

.sort({ createdAt: -1 })
– Sorts the results so that the most recently added product comes first.

Response
– Sends back a JSON response with:

success: true

count: number of products found

products: actual list of those products
*/ 
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user.id })
      .sort({ createdAt: -1 }); // Newest first
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
};

//get all products without auth route for home page 
const getAllProducts = async (req, res) => {
  try {
    // ✅ Fetch all products from MongoDB
    const products = await Product.find();

    // ✅ If no products found
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    // ✅ Success response
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Verify ownership
    if (product.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this product'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    //destrcutre : object propties into variable so we doesnt have to store one by one req.body.name 
    const { name, description, price, quantity } = req.body;

    // Validation of empty fields 
    if (!name || !description || price === undefined || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, description, price, quantity)'
      });
    }
   //Validation of the price and quntity
    if (price < 0 || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price and quantity cannot be negative'
      });
    }
   //if valdation passed then it will store the data in to the product model datbase 
    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity),
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
// 🧾 Function to update an existing product
const updateProduct = async (req, res) => {
  try {
    // 🔹 Find the product in the database using the ID from the URL (example: /api/products/123)
    let product = await Product.findById(req.params.id);

    // 🔹 If the product doesn’t exist, send a 404 "Not Found" response
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // 🔹 Check if the logged-in user owns this product
    // Convert both IDs to strings before comparing
    if (product.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // 🔹 Extract the updated values from the request body
    const { name, description, price, quantity } = req.body;

    // 🧩 Validation checks
    // If price is provided and it’s negative, reject the request
    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
    }

    // If quantity is provided and it’s negative, reject the request
    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity cannot be negative'
      });
    }

    // 🔹 Update the product using Mongoose’s findByIdAndUpdate method
    product = await Product.findByIdAndUpdate(
      req.params.id, // Product ID to update
      {
        // Only update fields if new values are provided; otherwise, keep old ones
        name: name ? name.trim() : product.name,
        description: description ? description.trim() : product.description,
        price: price !== undefined ? parseFloat(price) : product.price,
        quantity: quantity !== undefined ? parseInt(quantity) : product.quantity
      },
      {
        new: true,          // Return the updated product instead of the old one
        runValidators: true // Run Mongoose validation rules
      }
    );

    // 🔹 Send a success response with the updated product
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    // ⚠️ If any error happens, log it in the console
    console.error('Error updating product:', error);

    // 🔹 If the ID format is invalid (not a real MongoDB ObjectId)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // 🔹 For all other errors, return a general server error
    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
// Delete a product by its ID
const deleteProduct = async (req, res) => {
  try {
    // 🔍 Find the product using the ID from the request parameters
    const product = await Product.findById(req.params.id);

    // ⚠️ If no product is found, return a 404 (Not Found) response
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // 🔐 Verify if the logged-in user owns this product
    // If the userId of the product does not match the logged-in user’s ID, deny access
    if (product.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    // 🗑️ Delete the product from the database using its ID
    await Product.findByIdAndDelete(req.params.id);

    // ✅ Send success response after deletion
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    // ❌ Log the error for debugging purposes
    console.error('Error deleting product:', error);

    // ⚠️ If the ID format is invalid, send a 404 (Not Found) response
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // ⚙️ Send a 500 (Internal Server Error) response for any other errors
    res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
};

// 🧩 Export all product controller functions to be used in routes
module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts
};
