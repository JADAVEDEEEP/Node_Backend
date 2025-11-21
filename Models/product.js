const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },

  category: {
    type: String,
    default: ""
  },

  subCategory: {
    type: String,
    default: ""
  },

  sizes: {
    type: [String],   // array of strings
    default: []
  },

  colors: {
    type: [String],   // array of strings
    default: []
  },

  image: {
    type: String,
    default: ""
  },

  galleryImages: {
    type: [String],
    default: []
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  }

}, { timestamps: true });

productSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
