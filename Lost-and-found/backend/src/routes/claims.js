const express = require('express');
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   POST /api/claims
// @desc    Submit a claim for an item
// @access  Private
router.post('/', auth, upload.array('proofDocuments', 3), async (req, res) => {
  try {
    const {
      itemId,
      fullName,
      phone,
      idType,
      idNumber,
      description,
      additionalProof
    } = req.body;

    // Check if item exists and is active
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status !== 'active') {
      return res.status(400).json({ message: 'This item is no longer available for claims' });
    }

    // Prevent owner from claiming their own item
    if (item.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot claim your own item' });
    }

    // Check for existing claim by this user for this item
    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user._id
    });

    if (existingClaim) {
      return res.status(400).json({ message: 'You have already submitted a claim for this item' });
    }

    // Check for multiple claims in short time (security measure)
    const recentClaims = await Claim.checkMultipleClaims(req.user._id, 1); // 1 hour
    if (recentClaims >= 3) {
      return res.status(429).json({ 
        message: 'Too many claims submitted recently. Please wait before submitting another claim.' 
      });
    }

    // Process uploaded proof documents
    const proofDocuments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path
    })) : [];

    // Create claim
    const claim = new Claim({
      item: itemId,
      claimant: req.user._id,
      itemOwner: item.postedBy,
      verificationDetails: {
        fullName,
        phone,
        idType,
        idNumber,
        description,
        additionalProof
      },
      proofDocuments,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await claim.save();

    // Populate for response
    await claim.populate([
      { path: 'claimant', select: 'name email' },
      { path: 'item', select: 'title type imageUrls' }
    ]);

    res.status(201).json({
      message: 'Claim submitted successfully',
      claim: claim.toSafeObject()
    });
  } catch (error) {
    console.error('Error submitting claim:', error);
    res.status(500).json({ message: 'Server error submitting claim' });
  }
});

// @route   GET /api/claims/my-claims
// @desc    Get current user's claims
// @access  Private
router.get('/my-claims', auth, async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate('item', 'title type imageUrls location')
      .populate('itemOwner', 'name')
      .sort('-createdAt');

    const safeClaims = claims.map(claim => claim.toSafeObject());
    res.json(safeClaims);
  } catch (error) {
    console.error('Error fetching user claims:', error);
    res.status(500).json({ message: 'Server error fetching claims' });
  }
});

// @route   GET /api/claims/pending-review
// @desc    Get claims pending review for current user's items
// @access  Private
router.get('/pending-review', auth, async (req, res) => {
  try {
    const claims = await Claim.find({ 
      itemOwner: req.user._id,
      status: 'pending'
    })
      .populate('claimant', 'name email createdAt')
      .populate('item', 'title type imageUrls location')
      .sort('-createdAt');

    const safeClaims = claims.map(claim => claim.toSafeObject());
    res.json(safeClaims);
  } catch (error) {
    console.error('Error fetching pending claims:', error);
    res.status(500).json({ message: 'Server error fetching pending claims' });
  }
});

// @route   GET /api/claims/:claimId
// @desc    Get specific claim details (only for involved parties)
// @access  Private
router.get('/:claimId', auth, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId)
      .populate('claimant', 'name email createdAt')
      .populate('itemOwner', 'name email')
      .populate('item', 'title type imageUrls location description');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Check if user is involved in this claim
    const isClaimant = claim.claimant._id.toString() === req.user._id.toString();
    const isOwner = claim.itemOwner._id.toString() === req.user._id.toString();

    if (!isClaimant && !isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(claim.toSafeObject());
  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({ message: 'Server error fetching claim' });
  }
});

// @route   PUT /api/claims/:claimId/review
// @desc    Review a claim (approve/reject) - only item owner
// @access  Private
router.put('/:claimId/review', auth, async (req, res) => {
  try {
    const { decision, notes } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision' });
    }

    const claim = await Claim.findById(req.params.claimId);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Check if user is the item owner
    if (claim.itemOwner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the item owner can review claims' });
    }

    if (claim.status !== 'pending') {
      return res.status(400).json({ message: 'This claim has already been reviewed' });
    }

    // Update claim
    claim.ownerReview = {
      decision,
      notes,
      reviewedAt: new Date()
    };
    claim.status = decision;

    await claim.save();

    // If approved, update item status
    if (decision === 'approved') {
      await Item.findByIdAndUpdate(claim.item, {
        status: 'resolved'
      });
    }

    await claim.populate([
      { path: 'claimant', select: 'name email' },
      { path: 'item', select: 'title type' }
    ]);

    res.json({
      message: `Claim ${decision} successfully`,
      claim: claim.toSafeObject()
    });
  } catch (error) {
    console.error('Error reviewing claim:', error);
    res.status(500).json({ message: 'Server error reviewing claim' });
  }
});

// @route   PUT /api/claims/:claimId/complete-handover
// @desc    Mark handover as completed
// @access  Private
router.put('/:claimId/complete-handover', auth, async (req, res) => {
  try {
    const { location, notes } = req.body;

    const claim = await Claim.findById(req.params.claimId);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Check if user is involved in this claim
    const isClaimant = claim.claimant.toString() === req.user._id.toString();
    const isOwner = claim.itemOwner.toString() === req.user._id.toString();

    if (!isClaimant && !isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (claim.status !== 'approved') {
      return res.status(400).json({ message: 'Claim must be approved before handover' });
    }

    // Update handover details
    if (!claim.handoverDetails) {
      claim.handoverDetails = {};
    }

    if (isOwner) {
      claim.handoverDetails.confirmedByOwner = true;
    }
    if (isClaimant) {
      claim.handoverDetails.confirmedByClaimant = true;
    }

    if (location) claim.handoverDetails.location = location;
    if (notes) claim.handoverDetails.notes = notes;

    // If both parties confirmed, mark as completed
    if (claim.handoverDetails.confirmedByOwner && claim.handoverDetails.confirmedByClaimant) {
      claim.status = 'completed';
      claim.handoverDetails.completedAt = new Date();

      // Update item status to resolved
      await Item.findByIdAndUpdate(claim.item, {
        status: 'resolved'
      });

      // Update user stats
      await User.findByIdAndUpdate(claim.itemOwner, {
        $inc: { 'stats.itemsReturned': 1 }
      });
    }

    await claim.save();

    await claim.populate([
      { path: 'claimant', select: 'name email' },
      { path: 'itemOwner', select: 'name email' },
      { path: 'item', select: 'title type' }
    ]);

    res.json({
      message: claim.status === 'completed' ? 'Handover completed successfully!' : 'Handover confirmation recorded',
      claim: claim.toSafeObject()
    });
  } catch (error) {
    console.error('Error completing handover:', error);
    res.status(500).json({ message: 'Server error completing handover' });
  }
});

// @route   GET /api/claims/item/:itemId
// @desc    Get all claims for a specific item (only for item owner)
// @access  Private
router.get('/item/:itemId', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the item owner
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const claims = await Claim.find({ item: req.params.itemId })
      .populate('claimant', 'name email createdAt')
      .sort('-createdAt');

    const safeClaims = claims.map(claim => claim.toSafeObject());
    res.json(safeClaims);
  } catch (error) {
    console.error('Error fetching item claims:', error);
    res.status(500).json({ message: 'Server error fetching item claims' });
  }
});

module.exports = router;