var jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET || 'AkshayWill!';

const fatchUser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        console.warn('No token provided in request to', req.path);
        return res.status(401).json({
            success: false,
            message: "Authorization token not found"
        });
    }
    try {
        const data = jwt.verify(token, jwt_secret);
        req.user = data.user;
        console.log('Token verified for user:', req.user.id, 'Path:', req.path);
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        console.error('Path:', req.path);
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
            error: error.message
        });
    }
}

module.exports = fatchUser;