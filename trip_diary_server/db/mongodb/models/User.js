const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid');

// 生成随机昵称，截取 UUID 前 4 位
const generateRandomNickname = () => '用户_' + uuidv4().slice(0, 6); 

// 生成随机昵称, 取时间戳后4位

// 定义数据模型
const userSchema = new mongoose.Schema({
    openid: { // 微信openid
        type: String,
        required: true,
        unique: true // 确保openId是唯一的
    },
    username: { // 用户应用中的用户名
        type: String,
        required: true,
        unique: true // 确保openId是唯一的
    },
    password: { // 密码
        type: String,
        required: true,
    },
    nickname: { // 微信昵称
        type: String,
        required: true,
        unique: true, // 确保openId是唯一的
        default: generateRandomNickname
    },
    avatarUrl: { // 头像URL
        type: String,
        required: true,
        default: '/images/default_avatar.png' 
    },
    gender: {
        type: Number, // 0为未知，1为男性，2为女性
        required: true,
        default: 0 // 默认值为0
    },
    tip: { // 个性签名
        type: String, 
        required: true, 
        default: '用户太懒，暂无介绍' // 默认值为空字符串
    },
    phone: String, 
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
},{collection: 'user'})

module.exports = mongoose.model('User', userSchema)