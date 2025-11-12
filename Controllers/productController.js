const Product = require('../Models/product');

// @desc    Get all products for logged-in user
// @route   GET /api/products
// @access  Private
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
    const { name, description, price, quantity } = req.body;

    // Validation
    if (!name || !description || price === undefined || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, description, price, quantity)'
      });
    }

    if (price < 0 || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price and quantity cannot be negative'
      });
    }

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
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

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
        message: 'Not authorized to update this product'
      });
    }

    const { name, description, price, quantity } = req.body;

    // Validation
    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
    }

    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity cannot be negative'
      });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name ? name.trim() : product.name,
        description: description ? description.trim() : product.description,
        price: price !== undefined ? parseFloat(price) : product.price,
        quantity: quantity !== undefined ? parseInt(quantity) : product.quantity
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
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
        message: 'Not authorized to delete this product'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
};

module.exports={
  getProducts,getProductById,createProduct,updateProduct,deleteProduct
}