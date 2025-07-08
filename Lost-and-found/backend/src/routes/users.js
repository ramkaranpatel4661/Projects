const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/:id
// @desc    Get user profile by ID with messaging capability
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's active items count
    const itemsCount = await Item.countDocuments({ 
      postedBy: user._id, 
      status: 'active' 
    });

    // Get user's recent items (public info)
    const recentItems = await Item.find({
      postedBy: user._id,
      status: 'active'
    })
    .select('title type category location createdAt imageUrls')
    .sort('-createdAt')
    .limit(6);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        itemsCount,
        isActive: user.isActive,
        lastSeen: user.lastSeen
      },
      recentItems
    });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

// @route   GET /api/users/:id/items
// @desc    Get user's public items
// @access  Public
router.get('/:id/items', async (req, res) => {
  try {
    const { page = 1, limit = 12, type } = req.query;

    const query = { 
      postedBy: req.params.id, 
      status: 'active' 
    };

    if (type && ['found', 'lost'].includes(type)) {
      query.type = type;
    }

    const items = await Item.find(query)
      .populate('postedBy', 'name email')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Item.countDocuments(query);

    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('User items fetch error:', error);
    res.status(500).json({ message: 'Server error fetching user items' });
  }
});

// @route   POST /api/users/:id/message
// @desc    Start a direct message conversation with a user (not item-specific)
// @access  Private
router.post('/:id/message', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id.toString();

    // Prevent messaging yourself
    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: 'You cannot message yourself' });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // For direct messaging, we need a general chat not tied to a specific item
    // We'll create a "general" item or use a different approach
    // For now, let's find if there's any existing chat between these users
    const existingChat = await Chat.findOne({
      participants: { $all: [currentUserId, targetUserId], $size: 2 }
    }).populate('participants', 'name email');

    if (existingChat) {
      return res.json({ chat: existingChat });
    }

    // If no existing chat, we need an item context for our current system
    // Let's find any item posted by the target user to create context
    const userItem = await Item.findOne({ postedBy: targetUserId, status: 'active' });
    
    if (!userItem) {
      return res.status(400).json({ 
        message: 'Cannot start direct message. User has no active items to reference.' 
      });
    }

    // Create new chat using the user's item as context
    const newChat = new Chat({
      item: userItem._id,
      participants: [currentUserId, targetUserId],
      messages: []
    });

    await newChat.save();
    await newChat.populate('participants', 'name email');

    res.json({ chat: newChat });
  } catch (error) {
    console.error('Direct message error:', error);
    res.status(500).json({ message: 'Server error starting direct message' });
  }
});

// @route   GET /api/users/search
// @desc    Search users for messaging
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user._id } // Exclude current user
    })
      .select('name email avatar isActive lastSeen')
      .limit(parseInt(limit))
      .exec();

    res.json(users);
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Server error searching users' });
  }
});

module.exports = router;