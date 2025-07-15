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


    // Find existing chat between current user and item owner for this specific item
    let chat = await Chat.findOne({
      item: itemId,
      $or: [
        { participants: { $all: [currentUserId, itemOwnerId] } },
        { participants: currentUserId }
      ]
    })
      .populate('participants', 'name email')
      .populate('messages.sender', 'name email');

    if (!chat) {
      // Determine participants
      const participants = currentUserId === itemOwnerId 
        ? [currentUserId] 
        : [currentUserId, itemOwnerId];
        
      // Create new private chat between current user and item owner
      chat = new Chat({
        item: itemId,
        participants: participants,
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

    console.log('📩 [chat.js] Sending message:', { itemId, content, userId: req.user._id });

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      console.warn('⛔ [chat.js] Invalid message content:', content);
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      console.error('❌ [chat.js] Item not found:', itemId);
      return res.status(404).json({ message: 'Item not found' });
    }

    const currentUserId = req.user._id.toString();
    const itemOwnerId = item.postedBy.toString();

    console.log('👥 [chat.js] Participants:', { currentUserId, itemOwnerId });


    // Find existing chat between current user and item owner
    let chat = await Chat.findOne({
      item: itemId,
      $or: [
        { participants: { $all: [currentUserId, itemOwnerId] } },
        { participants: currentUserId }
      ]
    });

    console.log('💬 [chat.js] Existing chat found:', !!chat);

    if (!chat) {
      // Create new private chat with exactly 2 participants
      console.log('🆕 [chat.js] Creating new chat');
      
      // Determine participants - if user is item owner, they can still chat (for testing/admin purposes)
      const participants = currentUserId === itemOwnerId 
        ? [currentUserId] 
        : [currentUserId, itemOwnerId];
      
      chat = new Chat({
        item: itemId,
        participants: participants,
        messages: [{
          sender: currentUserId,
          content: content.trim(),
          timestamp: new Date()
        }]
      });
    } else {
      // Check if current user is a participant in this chat
      const isParticipant = chat.participants.some(
        participant => participant.toString() === currentUserId
      );
      
      if (!isParticipant) {
        console.warn('⛔ [chat.js] User not a participant in this chat');
        return res.status(403).json({ message: 'You are not authorized to send messages in this chat' });
      }
      
      // Add message to existing chat
      console.log('➕ [chat.js] Adding message to existing chat');
      chat.messages.push({
        sender: currentUserId,
        content: content.trim(),
        timestamp: new Date()
      });
    }

    chat.lastMessage = new Date();
    
    try {
      await chat.save();
      console.log('💾 [chat.js] Chat saved successfully');
    } catch (saveError) {
      console.error('❌ [chat.js] Failed to save chat:', saveError);
      return res.status(500).json({ message: 'Failed to save message' });
    }


    await chat.populate('participants', 'name email');
    await chat.populate('messages.sender', 'name email');
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      const newMessage = chat.messages[chat.messages.length - 1];
      
      // Emit to all participants except the sender
      chat.participants.forEach(participant => {
        const participantId = participant._id.toString();
        if (participantId !== currentUserId) {
          io.to(`user_${participantId}`).emit('new_message', {
            itemId,
            message: newMessage,
            chatId: chat._id
          });
        }
      });
    }

    console.log('✅ [chat.js] Message sent successfully');
    res.json({ chat });
  } catch (error) {
    console.error('❌ [chat.js] Send message error:', error);
    console.error('Error stack:', error.stack);
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
      .lean()
      .exec();

    // Only include the last message for each chat
    const chatsWithLastMessage = chats.map(chat => {
      const lastMsg = chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
      
      // Ensure participants array is properly populated
      const participants = chat.participants || [];
      
      return {
        ...chat,
        participants,
        messages: lastMsg ? [lastMsg] : []
      };
    });

    // Populate sender for the last message
    const populatedChats = await Promise.all(chatsWithLastMessage.map(async chat => {
      if (chat.messages.length > 0) {
        try {
          const sender = await require('../models/User').findById(chat.messages[0].sender).select('name email');
          if (sender) {
            chat.messages[0].sender = sender;
          }
        } catch (error) {
          console.error('Error populating message sender:', error);
        }
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

// @route   PUT /api/chat/:chatId/messages/:messageId
// @desc    Edit a message (only by sender)
// @access  Private
router.put('/:chatId/messages/:messageId', auth, async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }

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

    // Find the message
    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if current user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }

    // Update message
    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();

    await chat.save();

    await chat.populate('participants', 'name email');
    await chat.populate('messages.sender', 'name email');

    res.json({ message: 'Message updated successfully', chat });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Server error editing message' });
  }
});

// @route   DELETE /api/chat/:chatId/messages/:messageId
// @desc    Delete a message (only by sender)
// @access  Private
router.delete('/:chatId/messages/:messageId', auth, async (req, res) => {
  try {
    const { chatId, messageId } = req.params;

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

    // Find the message
    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if current user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    // Remove message
    chat.messages.pull(messageId);
    await chat.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error deleting message' });
  }
});

module.exports = router;