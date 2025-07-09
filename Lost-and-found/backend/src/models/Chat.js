const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
});

const chatSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [messageSchema],
  lastMessage: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for last message content
chatSchema.virtual('lastMessageContent').get(function () {
  if (this.messages && this.messages.length > 0) {
    return this.messages[this.messages.length - 1];
  }
  return null;
});

// Ensure unique chat between two specific users for a specific item
chatSchema.index({ 
  item: 1, 
  participants: 1 
}, { 
  unique: true,
  partialFilterExpression: { 
    participants: { $size: 2 } 
  }
});

// Other indexes for performance
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessage: -1 });
chatSchema.index({ item: 1, participants: 1 });

// Pre-save middleware to ensure privacy constraints
chatSchema.pre('save', function(next) {
  // Remove duplicate participants and ensure maximum 2 participants
  const uniqueParticipants = [...new Set(this.participants.map(p => p.toString()))];
  
  // Ensure maximum 2 participants for private chat
  if (uniqueParticipants.length > 2) {
    return next(new Error('Private chat can only have 2 participants'));
  }
  
  // Update participants with unique values
  this.participants = uniqueParticipants;
  
  next();
});

// Static method to find private chat between two users for specific item
chatSchema.statics.findPrivateChat = function(itemId, userId1, userId2) {
  return this.findOne({
    item: itemId,
    participants: { $all: [userId1, userId2], $size: 2 }
  });
};

// Instance method to check if user is participant
chatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(participantId => 
    participantId.toString() === userId.toString()
  );
};

// Instance method to get other participant
chatSchema.methods.getOtherParticipant = function(currentUserId) {
  return this.participants.find(participantId => 
    participantId.toString() !== currentUserId.toString()
  );
};

module.exports = mongoose.model('Chat', chatSchema);