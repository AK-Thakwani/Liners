const express = require('express');
const router = express.Router();
const Liner = require('../models/Liner');
const { body, validationResult } = require('express-validator');
const fetchUser = require('../middleware/fatchuser'); // Auth middleware
const streamifier = require('streamifier');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary'); // your Cloudinary config
const { moderateContent, getModerationErrorMessage } = require('../utils/contentModeration');

const upload = multer(); // memory storage

// 🔍 Diagnostic endpoint - test if liner routes are accessible
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Liner routes are working!' });
});

// 1. Create a Liner (POST /api/liner/create)
router.post('/create', fetchUser, upload.single('image'), [
    body('content', 'Liner must not be empty').isLength({ min: 1 }),
    body('tag', 'Enter a tag').optional().isLength({ min: 1 })
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      // 🛡️ Content Moderation Check
      const moderationResult = moderateContent(
        req.body.content,
        req.body.tag,
        req.file
      );

      if (!moderationResult.isApproved) {
        return res.status(400).json({
          success: false,
          message: getModerationErrorMessage(moderationResult.reasons),
          moderationDetails: {
            reasons: moderationResult.reasons,
            confidence: moderationResult.confidence
          }
        });
      }
  
      // 🔁 Cloudinary Upload
      let imageUrl = '';
      if (req.file) {
        const streamUpload = (buffer) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'liners' },
              (error, result) => {
                if (result) resolve(result);
                else reject(error);
              }
            );
            streamifier.createReadStream(buffer).pipe(stream);
          });
        };
  
        const result = await streamUpload(req.file.buffer);
        imageUrl = result.secure_url;
      }
  
      // 🔐 Create the Liner
      const liner = new Liner({
        content: req.body.content,
        tag: req.body.tag,
        image: imageUrl,
        user: req.user.id,
        moderationStatus: 'approved', // Content passed moderation
        moderationFlags: moderationResult.reasons.length > 0 ? 
          moderationResult.reasons.map(reason => ({
            reason,
            confidence: moderationResult.confidence
          })) : []
      });
  
      const saved = await liner.save();
      res.status(201).json({ success: true, liner: saved });
  
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  

// 2. Get All Liners (GET /api/liner/allposts)
router.get('/allposts', fetchUser, async (req, res) => {
    try {
        console.log('Fetching allposts for user:', req.user.id);
        
        // Get pagination params from query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        console.log('Page:', page, 'Limit:', limit, 'Skip:', skip);

        // Only show approved posts that are not hidden
        const liners = await Liner.find({ 
            moderationStatus: 'approved',
            isHidden: false 
        }).populate('user', 'name profilePicture email followers following').sort({ createdAt: -1 }).skip(skip).limit(limit);
        
        console.log('Found', liners.length, 'liners');
        res.json({ success: true, liners });
    } catch (error) {
        console.error('Error in allposts endpoint:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Get My Liners (GET /api/liner/my)
router.get('/my', fetchUser, async (req, res) => {
    try {
        // Users can see their own posts regardless of moderation status
        const liners = await Liner.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, liners });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. Delete a Liner (DELETE /api/liner/:id)
router.delete('/:id', fetchUser, async (req, res) => {
    try {
        const liner = await Liner.findById(req.params.id);
        if (!liner) {
            return res.status(404).json({ success: false, message: "Liner not found" });
        }

        if (liner.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: "Not allowed" });
        }

        await Liner.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Liner deleted" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

//like a post
router.put('/like/:id', fetchUser, async (req, res) => {
    try {
        const liner = await Liner.findById(req.params.id);
        if (!liner) {
            return res.status(404).json({ success: false, message: "Liner not found" });
        }

        if (!liner.likes.includes(req.user.id)) {
            liner.likes.push(req.user.id);
            await liner.save();
        }
        res.json({ success: true, likes: liner.likes, likesCount: liner.likes.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// unlike a post 
router.put('/unlike/:id', fetchUser, async (req, res) => {
    try {
        const liner = await Liner.findById(req.params.id);

        if (!liner) {
            return res.status(404).json({ success: false, message: "Liner not found" });
        }

        liner.likes = liner.likes.filter(uid => uid.toString() !== req.user.id);
        await liner.save();
        res.json({ success: true, likes: liner.likes, likesCount: liner.likes.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
  });

// comment on a post
router.post('/comment/:id', fetchUser, async (req, res) => {
    const liner = await Liner.findById(req.params.id);
    const comment = {
      user: req.user.id,
      text: req.body.text
    };
    liner.comments.push(comment);
    await liner.save();
    res.json({ success: true, comments: liner.comments });
  });

// Get posts by specific user (GET /api/liner/userposts/:userId)
router.get('/userposts/:userId', fetchUser, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if the target user exists and get their privacy status
        const User = require('../models/User');
        const targetUser = await User.findById(userId).select('isPrivate followers');
        
        if (!targetUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        // Check if current user can view posts
        const canView = !targetUser.isPrivate || 
                       targetUser.followers.includes(req.user.id) || 
                       req.user.id === userId;
        
        if (!canView) {
            return res.status(403).json({ 
                success: false, 
                message: "This account is private. Follow to see posts." 
            });
        }
        
        // Get posts with user details populated (only approved posts)
        const liners = await Liner.find({ 
            user: userId,
            moderationStatus: 'approved',
            isHidden: false 
        })
            .populate('user', 'name profilePicture')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, liners });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin routes for content moderation
// Get flagged posts (admin only)
router.get('/flagged', fetchUser, async (req, res) => {
    try {
        // In a real app, you'd check if user is admin
        // For now, we'll allow any authenticated user to see flagged posts
        const liners = await Liner.find({ 
            moderationStatus: { $in: ['flagged', 'pending'] },
            isHidden: false 
        })
        .populate('user', 'name profilePicture')
        .sort({ createdAt: -1 });
        
        res.json({ success: true, liners });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Moderate a post (approve/reject/hide)
router.put('/moderate/:id', fetchUser, async (req, res) => {
    try {
        const { action } = req.body; // 'approve', 'reject', 'hide'
        const { id } = req.params;
        
        if (!['approve', 'reject', 'hide'].includes(action)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid action. Use approve, reject, or hide.' 
            });
        }
        
        const liner = await Liner.findById(id);
        if (!liner) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        
        // Update moderation status
        let updateData = {};
        switch (action) {
            case 'approve':
                updateData = { 
                    moderationStatus: 'approved',
                    isHidden: false 
                };
                break;
            case 'reject':
                updateData = { 
                    moderationStatus: 'rejected',
                    isHidden: true 
                };
                break;
            case 'hide':
                updateData = { 
                    moderationStatus: 'approved',
                    isHidden: true 
                };
                break;
        }
        
        const updatedLiner = await Liner.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true }
        ).populate('user', 'name profilePicture');
        
        res.json({ 
            success: true, 
            message: `Post ${action}d successfully`,
            liner: updatedLiner 
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
