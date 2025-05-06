const mongoose = require('mongoose')

// 定义数据模型
const userSchema = new mongoose.Schema({
    openId: { // 微信openId
        type: Number,
        required: true,
        unique: true // 确保openId是唯一的
    },
    username: { // 用户应用中的用户名
        type: String,
        required: true,
    },
    nickname: { // 微信昵称
        type: String,
        required: true,
    },
    avatarUrl: { // 头像URL
        type: String,
        required: true
    },
    gender: {
        type: Number, // 0为未知，1为男性，2为女性
        required: true,
        default: 0 // 默认值为0
    },
    tip: { // 个性签名
        type: String, 
        required: true, 
        default: '' // 默认值为空字符串
    },
    phone: { // 手机号
        type: String, 
        required: true, 
        default: '' // 默认值为空字符串
    },
    createdAt: { // 创建时间
        type: Date, 
        required: true,
        default: Date.now // 默认值为当前时间
    },
    updatedAt: { // 更新时间
        type: Date, 
        required: true,
        default: Date.now // 默认值为当前时间
    }
},{collation: 'user'})

module.exports = mongoose.model('User', userSchema)