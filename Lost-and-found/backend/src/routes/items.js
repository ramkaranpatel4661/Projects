const express = require('express');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/items
// @desc    Get all items with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      type,
      category,
      location,
      search,
      page = 1,
      limit = 12,
      sort = '-createdAt'
    } = req.query;

    // Build query
    let query = {};
    
    // Handle special "returned" type filter
    if (type === 'returned') {
      query.status = 'resolved';
    } else {
      query.status = 'active';
      if (type && ['found', 'lost'].includes(type)) {
        query.type = type;
      }
    }
    
    if (category) {
      query.category = category;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const items = await Item.find(query)
      .populate('postedBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get claim status for each item
    const itemsWithClaimStatus = await Promise.all(items.map(async (item) => {
      const claim = await Claim.findOne({ 
        item: item._id, 
        status: { $in: ['approved', 'completed'] } 
      }).sort('-createdAt');
      
      const itemObj = item.toObject();
      if (claim) {
        itemObj.claimStatus = claim.status;
      }
      return itemObj;
    }));
    // Get total count for pagination
    const total = await Item.countDocuments(query);

    res.json({
      items: itemsWithClaimStatus,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Items fetch error:', error);
    res.status(500).json({ message: 'Server error fetching items' });
  }
});

// @route   GET /api/items/:id
// @desc    Get single item by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('postedBy', 'name email phone');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Increment view count
    item.views += 1;
    await item.save();
    
     const similarItems = await Item.find({
      _id:       { $ne: item._id },
      category:  item.category,
      type:      item.type,
      status:    'active'
    })
    .limit(4)
    .exec();

    res.json({ item,similarItems });
  } catch (error) {
    console.error('Item fetch error:', error);
    res.status(500).json({ message: 'Server error fetching item' });
  }
});

// @route   POST /api/items
// @desc    Post a lost or found item (generic)
// @access  Private
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      location,
      dateFound,
      dateLost,
      contactInfo,
      priority
    } = req.body;

    // Parse JSON fields if needed
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    const parsedContactInfo = typeof contactInfo === 'string' ? JSON.parse(contactInfo) : contactInfo;

    const item = new Item({
      title,
      description,
      category,
      type,
      location: parsedLocation,
      dateFound,
      dateLost,
      contactInfo: parsedContactInfo,
      priority,
      postedBy: req.user._id,
    });

    await item.save();
    await item.populate('postedBy', 'name email');

    // Process uploaded images and create URLs
    if (req.files && req.files.length > 0) {
      item.imageUrls = req.files.map(file => `/uploads/${file.filename}`);
      await item.save();
    }

    res.status(201).json({
      message: 'Item posted successfully',
      item
    });
  } catch (error) {
    console.error('Item post error:', error);
    res.status(500).json({ message: 'Server error posting item' });
  }
});

// @route   PUT /api/items/:id
// @desc    Update item
// @access  Private (only item owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const allowedUpdates = ['title', 'description', 'location', 'status', 'contactInfo'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email');

    res.json({
      message: 'Item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Item update error:', error);
    res.status(500).json({ message: 'Server error updating item' });
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private (only item owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Item delete error:', error);
    res.status(500).json({ message: 'Server error deleting item' });
  }
});

// @route   GET /api/items/user/my-items
// @desc    Get current user's items
// @access  Private
router.get('/user/my-items', auth, async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user._id })
      .sort('-createdAt')
      .populate('postedBy', 'name email');

    res.json(items);
  } catch (error) {
    console.error('User items fetch error:', error);
    res.status(500).json({ message: 'Server error fetching user items' });
  }
});

module.exports = router;