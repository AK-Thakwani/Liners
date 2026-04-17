const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: function () {
      return !this.isGoogleUser; // password is required if not a Google user
    }
  },

  isGoogleUser: {
    type: Boolean,
    default: false
  },

  profilePicture: {
    type: String,
    default: "https://ui-avatars.com/api/?name=User&background=random&bold=true"
  },

  // ✅ NEW FIELD → Public or Private account
  isPrivate: {
    type: Boolean,
    default: false
  },

  // ✅ Follower system
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  // ✅ Follow requests system
  followRequests: [{   // incoming requests (people who want to follow me)
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  sentRequests: [{     // outgoing requests (people I requested to follow)
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  // ✅ Password reset (OTP)
  resetPasswordOTP: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Avoid OverwriteModelError when this file is required multiple times
const User = mongoose.models.User || mongoose.model("User", UserSchema);
module.exports = User;
