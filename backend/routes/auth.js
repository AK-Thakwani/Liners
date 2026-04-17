const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMail } = require('../utils/mailer');
// google si login karna hai tu ya use kiya hai mana
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // store in .env

// ik ik kadam picha jana hai like pahela middleware fir fatchuser tu is liya .. 
const fatchUser = require('../middleware/fatchuser')

const jwt_secret = process.env.JWT_SECRET || 'AkshayWill!';
// Validation middleware
const validateUser = [
    body('name', 'Enter a valid name').isLength({ min: 5 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 8 characters').isLength({ min: 8 })
];

// Register User - Support both /register and /Register for compatibility
router.post('/register', validateUser, async (req, res) => {

    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }
        const salt = await bcrypt.genSalt(10);
        const secpass = await bcrypt.hash(req.body.password, salt);

        // Create new user
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: secpass
        });

        const data = {
            user: {
                id: user.id
            }
        }

        const savedUser = await user.save();
        const jwtData = jwt.sign(data, jwt_secret);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: savedUser,
            token: jwtData
        });
    } catch (error) {
        console.error('Error in user registration:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Alias for backward compatibility
router.post('/Register', validateUser, async (req, res) => {
    // Just forward to /register
    // Call the register route again with same params
    req.baseUrl = '/api/auth';
    require('express').Router().use('/api/auth', require('./auth'));
    // Actually just duplicate the handler for simplicity
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }
        const salt = await bcrypt.genSalt(10);
        const secpass = await bcrypt.hash(req.body.password, salt);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: secpass
        });

        const data = {
            user: {
                id: user.id
            }
        }

        const savedUser = await user.save();
        const jwtData = jwt.sign(data, jwt_secret);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: savedUser,
            token: jwtData
        });
    } catch (error) {
        console.error('Error in user registration:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});





// Delete User
router.delete('/delete', [
    body('email', 'Enter a valid email').isEmail()
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const deleteUser = await User.findOneAndDelete({ email: req.body.email });
        if (!deleteUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            user: deleteUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Update User
// PATCH /api/auth/update
router.patch('/update', fatchUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, password, currentPassword } = req.body;
        const updateFields = {};

        if (name) updateFields.name = name;
        if (email) updateFields.email = email;

        if (password) {
            const user = await User.findById(userId);
            if (user.isGoogleUser) {
                return res.status(400).json({ success: false, message: "Google users cannot change password." });
            }
            if (!currentPassword) {
                return res.status(400).json({ success: false, message: "Current password is required to change password." });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Current password is incorrect." });
            }
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true }
        ).select('-password');

        // For debugging only - do NOT log actual passwords in production!
        console.log('Received update request:');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Password provided:', !!password);
        console.log('Current password provided:', !!currentPassword);

        console.log('Sending updated user to frontend:', updatedUser);

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Utility: generate 6-digit OTP
function generateOTP() {
    const num = crypto.randomInt(0, 1000000);
    return num.toString().padStart(6, '0');
}

// POST /api/auth/forgot-password (request OTP)
router.post('/forgot-password', [
    body('email', 'Enter a valid email').isEmail()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.isGoogleUser) {
            return res.status(400).json({ success: false, message: 'Google users should use Google login.' });
        }

        const otp = generateOTP();
        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(otp, salt);

        user.resetPasswordOTP = hashedOTP;
        user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();

        try {
            await sendMail({
                to: email,
                subject: 'Your password reset code',
                text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
                html: `<div style="font-family:sans-serif;line-height:1.6">
                        <h2>Password reset code</h2>
                        <p>Your OTP is <strong style="font-size:18px;">${otp}</strong></p>
                        <p>This code will expire in 10 minutes.</p>
                       </div>`
            });
        } catch (mailErr) {
            console.error('Failed to send OTP email:', mailErr);
            // Still respond success to avoid user enumeration, but inform client
        }

        return res.status(200).json({ success: true, message: 'OTP sent to email' });
    } catch (error) {
        console.error('forgot-password error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', [
    body('email', 'Enter a valid email').isEmail(),
    body('otp', 'OTP must be 6 digits').isLength({ min: 6, max: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user || !user.resetPasswordOTP || !user.resetPasswordExpires) {
            return res.status(400).json({ success: false, message: 'OTP not requested' });
        }
        if (user.resetPasswordExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }
        const match = await bcrypt.compare(otp, user.resetPasswordOTP);
        if (!match) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
        return res.status(200).json({ success: true, message: 'OTP verified' });
    } catch (error) {
        console.error('verify-otp error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/auth/reset-password-with-otp
router.post('/reset-password-with-otp', [
    body('email', 'Enter a valid email').isEmail(),
    body('otp', 'OTP must be 6 digits').isLength({ min: 6, max: 6 }),
    body('newPassword', 'Password must be at least 8 characters').isLength({ min: 8 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user || !user.resetPasswordOTP || !user.resetPasswordExpires) {
            return res.status(400).json({ success: false, message: 'OTP not requested' });
        }
        if (user.resetPasswordExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }
        const match = await bcrypt.compare(otp, user.resetPasswordOTP);
        if (!match) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordOTP = null;
        user.resetPasswordExpires = null;
        await user.save();

        return res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        console.error('reset-password-with-otp error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

//auth route 2 for the token sending when you pass the correct password and correct email 
router.post('/login', [
    body('email', 'enter a valid email').isEmail(),
    body('password', 'enter a valid password').exists(),
], async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Handle both Password and password field names
        const hashedPassword = user.password || user.Password;
        if (!hashedPassword) {
            return res.status(500).json({
                success: false,
                message: "User password field not found"
            });
        }

        const passcom = await bcrypt.compare(password, hashedPassword);
        if (!passcom) {
            return res.status(404).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        const data = {
            user: {
                id: user.id
            }
        };
        const jwtData = jwt.sign(data, jwt_secret);
        res.json({ success: true, token: jwtData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

//auth route 3 for the getting the data of user 
router.post('/getuser', fatchUser, async (req, res) => {
    console.log('req.user:', req.user);
    try {
        const userid = req.user.id; // Or get it from JWT, etc.
        const foundUser = await User.findById(userid).select("-password");
        res.json({ success: true, user: foundUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});



// google login code 
// Google OAuth login
router.post('/google-login', async (req, res) => {
    const { token } = req.body;
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
    console.log('Received token:', token);

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        console.log('Decoded Google payload:', payload);
        const { email, name, picture, sub: googleId } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if not found
            user = await User.create({
                name,
                email,
                profilePicture: picture,
                password: '', // or null, since Google users don’t need it
                isGoogleUser: true
            });
        }

        const data = {
            user: {
                id: user.id
            }
        };

        const jwtData = jwt.sign(data, jwt_secret, { expiresIn: '7d' });
        console.log('JWT sent to frontend:', jwtData);

        res.status(200).json({
            success: true,
            message: "Google login successful",
            user,
            token: jwtData
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(400).json({ success: false, message: 'Google login failed' });
    }
});

// POST /api/auth/verify-password
router.post('/verify-password', fatchUser, async (req, res) => {
    try {
        const { currentPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (user.isGoogleUser) {
            return res.status(400).json({ success: false, message: "Google users cannot set a password." });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect." });
        }
        res.json({ success: true, message: "Password verified." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


module.exports = router;