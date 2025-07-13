const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  claimant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Verification details
  verificationDetails: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    idType: {
      type: String,
      enum: ['aadhaar', 'pan', 'driving_license', 'passport', 'voter_id'],
      required: true
    },
    idNumber: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 500
    },
    additionalProof: {
      type: String,
      maxlength: 500
    }
  },
  // File uploads
  proofDocuments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  // Review by item owner
  ownerReview: {
    decision: {
      type: String,
      enum: ['approved', 'rejected']
    },
    notes: {
      type: String,
      maxlength: 500
    },
    reviewedAt: Date
  },
  // Handover details
  handoverDetails: {
    completedAt: Date,
    location: String,
    notes: String,
    confirmedByOwner: {
      type: Boolean,
      default: false
    },
    confirmedByClaimant: {
      type: Boolean,
      default: false
    }
  },
  // Security and audit
  ipAddress: String,
  userAgent: String,
  securityFlags: {
    suspiciousActivity: {
      type: Boolean,
      default: false
    },
    multipleAttempts: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
claimSchema.index({ item: 1, claimant: 1 }, { unique: true });
claimSchema.index({ itemOwner: 1, status: 1 });
claimSchema.index({ claimant: 1, status: 1 });
claimSchema.index({ createdAt: -1 });

// Virtual for masked ID
claimSchema.virtual('maskedIdNumber').get(function() {
  if (!this.verificationDetails.idNumber) return '';
  const id = this.verificationDetails.idNumber;
  if (id.length <= 4) return 'XXXX';
  return 'XXXX XXXX ' + id.slice(-4);
});

// Virtual for masked phone
claimSchema.virtual('maskedPhone').get(function() {
  if (!this.verificationDetails.phone) return '';
  const phone = this.verificationDetails.phone;
  if (phone.length <= 4) return 'XXXXX';
  return 'XXXXX' + phone.slice(-4);
});

// Static method to check for multiple claims
claimSchema.statics.checkMultipleClaims = function(claimantId, timeWindow = 24) {
  const since = new Date(Date.now() - timeWindow * 60 * 60 * 1000);
  return this.countDocuments({
    claimant: claimantId,
    createdAt: { $gte: since }
  });
};

// Instance method to mask sensitive data for frontend
claimSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  
  // Remove sensitive data
  delete obj.verificationDetails.idNumber;
  delete obj.verificationDetails.phone;
  delete obj.ipAddress;
  delete obj.userAgent;
  
  // Add masked versions
  obj.maskedIdNumber = this.maskedIdNumber;
  obj.maskedPhone = this.maskedPhone;
  
  return obj;
};

module.exports = mongoose.model('Claim', claimSchema);