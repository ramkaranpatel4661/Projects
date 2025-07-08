const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Electronics', 'Clothing', 'Accessories', 'Documents', 'Keys', 'Bags', 'Jewelry', 'Books', 'Sports', 'Other']
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['found', 'lost']
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true }
  },
  dateFound: {
    type: Date,
    required: function() {
      return this.type === 'found';
    }
  },
  dateLost: {
    type: Date,
    required: function() {
      return this.type === 'lost';
    }
  },
  imageUrls: [{
    type: String,
    required: false
  }],
  contactInfo: {
    showPhone: { type: Boolean, default: false },
    showEmail: { type: Boolean, default: false },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true }
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'expired'],
    default: 'active'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better search performance
itemSchema.index({ title: 'text', description: 'text', location: 'text' });
itemSchema.index({ type: 1, status: 1, createdAt: -1 });
itemSchema.index({ category: 1 });
itemSchema.index({ postedBy: 1 });

module.exports = mongoose.model('Item', itemSchema);