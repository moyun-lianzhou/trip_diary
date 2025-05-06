const mongoose = require('mongoose');

// 替换为你的 MongoDB 连接字符串
const mongoURI = 'mongodb://localhost:27017/trip_diary';

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('MongoDB 连接成功');
    } catch (error) {
        console.error('MongoDB 连接失败:', error);
        process.exit(1);
    }
};

module.exports = connectDB;