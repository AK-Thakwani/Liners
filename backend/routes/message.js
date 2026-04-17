const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const fetchUser = require("../middleware/fatchuser");
const User = require("../models/User");
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');

const upload = multer(); // memory storage

// Upload media for message
router.post('/upload', fetchUser, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'messages', resource_type: 'auto' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer);
    res.json({
      success: true,
      mediaUrl: result.secure_url,
      mediaType: result.resource_type // 'image', 'video', 'raw'
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send a new message
router.post("/", fetchUser, async (req, res) => {
  const { receiver, text } = req.body;
  const sender = req.user.id;

  try {
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    const senderUser = await User.findById(sender).select('following followers');
    const receiverUser = await User.findById(receiver).select('isPrivate followers');

    // Check if receiver exists
    if (!receiverUser) {
      return res.status(404).json({ success: false, message: "Receiver not found" });
    }

    // Prevent sending messages to oneself
    if (sender === receiver) {
      return res.status(400).json({ success: false, message: "You cannot send messages to yourself" });
    }

    // 🔒 PRIVACY CHECK: If receiver has a private account
    // Only allow messaging if sender is in receiver's followers (follow request accepted)
    if (receiverUser.isPrivate) {
      const isFollower = Array.isArray(receiverUser.followers) && 
        receiverUser.followers.some(id => id.toString() === sender.toString());
      
      if (!isFollower) {
        return res.status(403).json({
          success: false,
          message: "Cannot message this user - their account is private and your follow request hasn't been accepted",
          code: "PRIVATE_ACCOUNT"
        });
      }
    }

    const newMessage = new Message({
      sender,
      receiver,
      text: text.trim(),
      timestamp: new Date()
    });

    // Persist then populate (Mongoose 6+)
    const savedMessage = await newMessage.save();
    await savedMessage.populate([
      { path: 'sender', select: 'name profilePicture' },
      { path: 'receiver', select: 'name profilePicture' }
    ]);

    res.status(201).json({ success: true, message: savedMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// Get all conversations for a user (MUST BE BEFORE /:user1/:user2)
router.get("/conversations", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching conversations for user:', userId);

    // Convert to ObjectId
    const { ObjectId } = require('mongoose').Types;
    const userObjectId = new ObjectId(userId);

    // Get all unique conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userObjectId },
            { receiver: userObjectId }
          ]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", userObjectId] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          messageCount: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$sender", userObjectId] },
                    { $eq: ["$isRead", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          user: {
            _id: "$user._id",
            name: "$user.name",
            profilePicture: "$user.profilePicture"
          },
          lastMessage: 1,
          messageCount: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { "lastMessage.timestamp": -1 }
      }
    ]);

    console.log('Found conversations:', conversations.length);
    console.log('Conversations data:', conversations);

    // Ensure conversations is an array
    const conversationsArray = Array.isArray(conversations) ? conversations : [];
    console.log('Sending to frontend:', JSON.stringify(conversationsArray, null, 2));

    res.json({ success: true, conversations: conversationsArray });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get chat between two users
router.get("/:user1/:user2", fetchUser, async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    // Verify user is part of this conversation
    if (req.user.id !== user1 && req.user.id !== user2) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    })
      .populate('sender', 'name profilePicture')
      .populate('receiver', 'name profilePicture')
      .sort({ timestamp: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark messages as read
router.put("/mark-read", fetchUser, async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.id;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ success: false, message: "Message IDs are required" });
    }

    // Mark all messages in the array as read (where user is the receiver)
    const result = await Message.updateMany(
      {
        _id: { $in: messageIds },
        receiver: userId
      },
      { $set: { isRead: true } }
    );

    res.json({ 
      success: true, 
      message: `Marked ${result.modifiedCount} messages as read` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
