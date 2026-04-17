const mongoose = require('mongoose');
require('dotenv').config();
const mongooseurl = process.env.MONGODB_URI || "mongodb://localhost:27017/mydb";

const connecttomongo = async () => {
    try {
        await mongoose.connect(mongooseurl);
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
}

module.exports = connecttomongo;