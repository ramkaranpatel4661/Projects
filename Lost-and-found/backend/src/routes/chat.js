const express = require('express');
const Chat = require('../models/Chat');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/chat/byid/:chatId
// @desc    Get chat details by chat ID (only for participants)
// @access  Private
router.get('/byid/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId)
      .populate('participants', 'name email')
      .populate('messages.sender', 'name email')
      .populate('item', 'title type imageUrls');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if current user is a participant in this chat
    const isParticipant = chat.participants.some(
      participant => participant._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied. You are not a participant in this chat.' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Chat fetch by id error:', error);
    res.status(500).json({ message: 'Server error fetching chat by id' });
  }
});

// @route   DELETE '/:chatId/messages'
// @desc    Clear all messages from a chat (only for participants)
// @access  Private
router.delete('/:chatId/messages', auth, async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if current user is a participant in this chat
    const isParticipant = chat.participants.some(
      participant => participant._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied. You are not a participant in this chat.' });
    }

    // Clear messages array
    chat.messages = [];
    await chat.save();

    res.json({ message: 'Chat cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat messages:', error);
    res.status(500).json({ message: 'Server error clearing chat messages' });
  }
});

// @route   GET /api/chat/:itemId
// @desc    Get or create chat for an item (private between item owner and interested user)
// @access  Private
router.get('/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const currentUserId = req.user._id.toString();
    const itemOwnerId = item.postedBy.toString();

    // Prevent user from chatting with themselves
    if (currentUserId === itemOwnerId) {
      return res.status(400).json({ message: 'You cannot start a chat with yourself' });
    }

    // Find existing chat between current user and item owner for this specific item
    let chat = await Chat.findOne({
      item: itemId,
      participants: { $all: [currentUserId, itemOwnerId], $size: 2 }
    })
      .populate('participants', 'name email')
      .populate('messages.sender', 'name email');

    if (!chat) {
      // Create new private chat between current user and item owner
      chat = new Chat({
        item: itemId,
        participants: [currentUserId, itemOwnerId], // Exactly 2 participants
        messages: []
      });
      
      await chat.save();
      await chat.populate('participants', 'name email');
    }

    res.json(chat);
  } catch (error) {
    console.error('Chat fetch error:', error);
    res.status(500).json({ message: 'Server error fetching chat' });
  }
});

// @route   POST /api/chat/:itemId
// @desc    Send a message in item chat (private between participants)
// @access  Private
router.post('/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const currentUserId = req.user._id.toString();
    const itemOwnerId = item.postedBy.toString();

    // Prevent user from messaging themselves
    if (currentUserId === itemOwnerId) {
      return res.status(400).json({ message: 'You cannot send a message to yourself' });
    }

    // Find existing chat between current user and item owner
    let chat = await Chat.findOne({
      item: itemId,
      participants: { $all: [currentUserId, itemOwnerId], $size: 2 }
    });

    if (!chat) {
      // Create new private chat with exactly 2 participants
      chat = new Chat({
        item: itemId,
        participants: [currentUserId, itemOwnerId],
        messages: [{
          sender: currentUserId,
          content: content.trim(),
          timestamp: new Date()
        }]
      });
    } else {
      // Add message to existing chat
      chat.messages.push({
        sender: currentUserId,
        content: content.trim(),
        timestamp: new Date()
      });
    }

    chat.lastMessage = new Date();
    await chat.save();

    await chat.populate('participants', 'name email');
    await chat.populate('messages.sender', 'name email');

    res.json({ chat });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

// @route   GET /api/chat/user/conversations
// @desc    Get all conversations for current user (only chats where user is participant)
// @access  Private
router.get('/user/conversations', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ 
      participants: req.user._id,
      messages: { $exists: true, $not: { $size: 0 } } // Only chats with messages
    })
      .populate('participants', 'name email')
      .populate('item', 'title type imageUrls')
      .sort('-lastMessage')
      .limit(20)
      .lean();

    // Only include the last message for each chat
    const chatsWithLastMessage = chats.map(chat => {
      const lastMsg = chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
      return {
        ...chat,
        messages: lastMsg ? [lastMsg] : []
      };
    });

    // Populate sender for the last message
    const populatedChats = await Promise.all(chatsWithLastMessage.map(async chat => {
      if (chat.messages.length > 0) {
        const sender = await require('../models/User').findById(chat.messages[0].sender).select('name email');
        chat.messages[0].sender = sender;
      }
      return chat;
    }));

    res.json(populatedChats);
  } catch (error) {
    console.error('Conversations fetch error:', error);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
});

// @route   PUT /api/chat/:chatId/read
// @desc    Mark messages as read (only for participants)
// @access  Private
router.put('/:chatId/read', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if current user is a participant
    const isParticipant = chat.participants.some(
      participant => participant._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied. You are not a participant in this chat.' });
    }

    // Mark all messages as read for this user (except their own messages)
    chat.messages.forEach(msg => {
      if (msg.sender.toString() !== req.user._id.toString()) {
        msg.isRead = true;
      }
    });

    await chat.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;