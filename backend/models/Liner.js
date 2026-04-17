const mongoose = require('mongoose');
const { Schema } = mongoose;

const linerSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String },
        date: { type: Date, default: Date.now }
      }
    ],
    tag: {
        type:String,
        required:false
    },
    image: {
        type: String,
        required: false
    },
    // Content moderation fields
    moderationStatus: {
        type: String,
        enum: ['approved', 'pending', 'rejected', 'flagged'],
        default: 'approved'
    },
    moderationFlags: [{
        reason: String,
        confidence: Number,
        flaggedAt: { type: Date, default: Date.now }
    }],
    isHidden: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Liner', linerSchema);
