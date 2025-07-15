const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Item = require('../models/Item');

const initializeSocket = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) return next(new Error('Authentication error'));

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User ${socket.user.name} connected`);
    
    // Join user's personal room for notifications
    socket.join(`user_${socket.userId}`);

    // Join item chat room (private between participants)
    socket.on('join_item_chat', async (itemId) => {
      try {
        // Verify user has access to this chat
        const item = await Item.findById(itemId);
        if (!item) return;

        const currentUserId = socket.userId;
        const itemOwnerId = item.postedBy.toString();

        // Only allow item owner and interested users to join
        if (currentUserId === itemOwnerId || currentUserId !== itemOwnerId) {
          // Create a unique room for this specific chat between these two users
          const chatRoomId = [currentUserId, itemOwnerId].sort().join('_') + '_' + itemId;
          socket.join(chatRoomId);
          console.log(`➡️ ${socket.user.name} joined private chat room: ${chatRoomId}`);

          // Store the chat room ID for this socket
          socket.currentChatRoom = chatRoomId;
        }
      } catch (error) {
        console.error('Error joining chat room:', error);
      }
    });

    // Leave item chat room
    socket.on('leave_item_chat', (itemId) => {
      if (socket.currentChatRoom) {
        socket.leave(socket.currentChatRoom);
        console.log(`⬅️ ${socket.user.name} left private chat room: ${socket.currentChatRoom}`);
        socket.currentChatRoom = null;
      }
    });

    // Handle sending messages (private between participants only)
    socket.on('send_message', async ({ itemId, content }) => {
      try {
        console.log('📨 [socket.js] Received send_message event:', { itemId, content, userId: socket.userId });
        
        const item = await Item.findById(itemId);
        if (!item) return;

        const currentUserId = socket.userId;
        const itemOwnerId = item.postedBy.toString();

        // Find or create private chat between current user and item owner
        let chat = await Chat.findOne({
          item: itemId,
          participants: { $all: [currentUserId, itemOwnerId] }
        });

        if (!chat) {
          // Create new private chat
          const participants = [currentUserId];
          if (itemOwnerId !== currentUserId) {
            participants.push(itemOwnerId);
          }

          chat = new Chat({
            item: itemId,
            participants,
            messages: []
          });
        }

        // Add new message
        const message = {
          sender: currentUserId,
          content,
          timestamp: new Date(),
          isRead: false
        };
        chat.messages.push(message);
        chat.lastMessage = new Date();
        
        try {
          await chat.save();
          console.log('💾 [socket.js] Chat saved via socket');
        } catch (saveError) {
          console.error('❌ [socket.js] Failed to save chat via socket:', saveError);
          return;
        }

        // Populate the newly added message
        const populatedChat = await chat.populate('messages.sender', 'name email');
        const newMessage = populatedChat.messages[populatedChat.messages.length - 1];

        // Create unique chat room ID for these two participants
        const chatRoomId = [currentUserId, itemOwnerId].sort().join('_') + '_' + itemId;

        // Emit message only to participants in this private chat
        // Only emit to OTHER participants (not the sender)
        chat.participants.forEach(participantId => {
          const participantIdStr = participantId.toString();
          if (participantIdStr !== currentUserId) {
            io.to(`user_${participantIdStr}`).emit('new_message', {
              itemId,
              message: newMessage,
              chatId: chat._id
            });
            console.log(`📩 Notification sent to user ${participantIdStr} for message from ${socket.user.name}`);
          }
        });

        console.log(`📩 Private message sent in item ${itemId} from ${socket.user.name} to chat participants only`);
      } catch (error) {
        console.error('❌ [socket.js] Error sending private message:', error);
        console.error('Error stack:', error.stack);
      }
    });

    // Typing indicators (only for participants)
    socket.on('typing_start', ({ itemId }) => {
      if (socket.currentChatRoom) {
        socket.to(socket.currentChatRoom).emit('user_typing', {
          userId: socket.userId,
          userName: socket.user.name,
          itemId
        });
      }
    });

    socket.on('typing_stop', ({ itemId }) => {
      if (socket.currentChatRoom) {
        socket.to(socket.currentChatRoom).emit('user_stop_typing', {
          userId: socket.userId,
          itemId
        });
      }
    });

    // Online status
    socket.on('update_status', async (status) => {
      try {
        await User.findByIdAndUpdate(socket.userId, {
          isActive: status === 'online',
          lastSeen: new Date()
        });

        socket.broadcast.emit('user_status_update', {
          userId: socket.userId,
          status,
          lastSeen: new Date()
        });
      } catch (err) {
        console.error('Status update error:', err);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ ${socket.user.name} disconnected`);
      try {
        await User.findByIdAndUpdate(socket.userId, {
          isActive: false,
          lastSeen: new Date()
        });

        socket.broadcast.emit('user_status_update', {
          userId: socket.userId,
          status: 'offline',
          lastSeen: new Date()
        });
      } catch (err) {
        console.error('Disconnect update error:', err);
      }
    });
  });
};

module.exports = { initializeSocket };