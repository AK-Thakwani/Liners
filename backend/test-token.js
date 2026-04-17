const jwt = require('jsonwebtoken');
const jwt_secret = 'AkshayWill!';

// Create a test token
const data = {
    user: {
        id: '507f1f77bcf86cd799439011'
    }
};
const token = jwt.sign(data, jwt_secret);
console.log('\n✅ Test Token Created:');
console.log(token);

// Verify it
try {
    const verified = jwt.verify(token, jwt_secret);
    console.log('\n✅ Token Verified Successfully!');
    console.log('Decoded data:', verified);
} catch (error) {
    console.error('\n❌ Verification failed:', error.message);
}
