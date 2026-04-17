const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const fetchUser = require('../middleware/fatchuser'); // Auth middleware
const cloudinary = require('../utils/cloudinary');
const upload = require('../middleware/upload');
const streamifier = require('streamifier');

// ===============================
// Search users (MUST BE BEFORE /:id routes)
// ===============================
router.get("/search", fetchUser, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters long"
      });
    }

    const searchQuery = q.trim();
    const currentUserId = req.user.id;

    // Search users by name or email (excluding current user)
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ]
    })
      .select('name email profilePicture')
      .limit(20);

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===============================
// Get follow requests (for private accounts) - MUST BE BEFORE /:id routes
// ===============================
router.get("/follow-requests", fetchUser, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id)
      .populate("followRequests", "name email profilePicture");

    res.status(200).json({
      success: true,
      followRequests: currentUser.followRequests
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// Get sent follow requests - MUST BE BEFORE /:id routes
// ===============================
router.get("/sent-requests", fetchUser, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id)
      .populate("sentRequests", "name email profilePicture");

    res.status(200).json({
      success: true,
      sentRequests: currentUser.sentRequests
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// Toggle account privacy (public/private) - MUST BE BEFORE /:id routes
// ===============================
router.put("/toggle-privacy", fetchUser, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    currentUser.isPrivate = !currentUser.isPrivate;

    await currentUser.save();

    res.status(200).json({
      success: true,
      message: `Account is now ${currentUser.isPrivate ? 'private' : 'public'}`,
      isPrivate: currentUser.isPrivate
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// Follow a user (with request system) - AFTER specific routes
// ===============================
router.put("/:id/follow", fetchUser, async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ success: false, message: "You can't follow yourself" });
  }

  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser) return res.status(404).json({ success: false, message: "User not found" });

    if (targetUser.followers.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: "Already following this user" });
    }

    if (targetUser.isPrivate) {
      if (targetUser.followRequests.includes(req.user.id)) {
        return res.status(400).json({ success: false, message: "Request already sent" });
      }
      targetUser.followRequests.push(req.user.id);
      currentUser.sentRequests.push(req.params.id);

      await targetUser.save();
      await currentUser.save();

      return res.status(200).json({ success: true, message: "Follow request sent" });
    } else {
      targetUser.followers.push(req.user.id);
      currentUser.following.push(req.params.id);

      await targetUser.save();
      await currentUser.save();

      return res.status(200).json({ success: true, message: "User followed" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// Accept follow request
// ===============================
router.put("/:id/accept", fetchUser, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const requesterId = req.params.id;

    if (!currentUser.followRequests.includes(requesterId)) {
      return res.status(400).json({ success: false, message: "No follow request from this user" });
    }

    currentUser.followers.push(requesterId);
    currentUser.followRequests = currentUser.followRequests.filter(id => id.toString() !== requesterId);

    const requester = await User.findById(requesterId);
    requester.following.push(req.user.id);
    requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== req.user.id);

    await currentUser.save();
    await requester.save();

    res.status(200).json({ success: true, message: "Follow request accepted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// Reject follow request
// ===============================
router.put("/:id/reject", fetchUser, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const requesterId = req.params.id;

    if (!currentUser.followRequests.includes(requesterId)) {
      return res.status(400).json({ success: false, message: "No follow request from this user" });
    }

    currentUser.followRequests = currentUser.followRequests.filter(id => id.toString() !== requesterId);

    const requester = await User.findById(requesterId);
    requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== req.user.id);

    await currentUser.save();
    await requester.save();

    res.status(200).json({ success: true, message: "Follow request rejected" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// Unfollow a user
// ===============================
router.put("/:id/unfollow", fetchUser, async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ success: false, message: "You can't unfollow yourself" });
  }

  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser.followers.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: "You are not following this user" });
    }

    targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.user.id);
    currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);

    await targetUser.save();
    await currentUser.save();

    res.status(200).json({ success: true, message: "User unfollowed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// Update profile picture
// ===============================
router.put("/profile-picture/:id", fetchUser, upload.single("image"), async (req, res) => {
  try {
    // Verify user is updating their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: "You can only update your own profile picture" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profile_pictures" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { profilePicture: result.secure_url },
      { new: true }
    ).select("-password -followers -following");

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Profile picture upload error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// Get followers list
// ===============================
router.get("/:id/followers", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("followers", "name email profilePicture");
    res.status(200).json({ success: true, followers: user.followers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// Get following list
// ===============================
router.get("/:id/following", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("following", "name email profilePicture");
    res.status(200).json({ success: true, following: user.following });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// Get public profile
// ===============================
router.get("/:id/profile", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name email profilePicture followers following followRequests isPrivate");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Get post count
    const Liner = require('../models/Liner');
    const postCount = await Liner.countDocuments({
      user: req.params.id,
      moderationStatus: 'approved',
      isHidden: false
    });

    res.status(200).json({
      success: true,
      user: {
        ...user._doc,
        postCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// Cancel sent follow request
// ===============================
router.put("/:id/cancel-request", fetchUser, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const targetUserId = req.params.id;

    if (!currentUser.sentRequests.includes(targetUserId)) {
      return res.status(400).json({ success: false, message: "No pending request to this user" });
    }

    // Remove from current user's sent requests
    currentUser.sentRequests = currentUser.sentRequests.filter(id => id.toString() !== targetUserId);

    // Remove from target user's follow requests
    const targetUser = await User.findById(targetUserId);
    if (targetUser && targetUser.followRequests.includes(req.user.id)) {
      targetUser.followRequests = targetUser.followRequests.filter(id => id.toString() !== req.user.id);
      await targetUser.save();
    }

    await currentUser.save();

    res.status(200).json({ success: true, message: "Follow request cancelled" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;