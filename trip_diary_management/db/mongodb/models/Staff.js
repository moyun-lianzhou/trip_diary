const mongoose = require('mongoose')

// 定义数据模型
const staffSchema = new mongoose.Schema({
    username: { // 用户名
        type: String,
        required: true,
        type: String,
        required: true
    },
    password: { // 密码
        type: String,
        required: true,
    },
    name: { // 姓名
        type: String,
        required: true,
    },
    avatarUrl: { // 头像URL
        type: String,
        required: true,
    },
    role: { // 角色，0为审核员，1为管理员
        type: Number,
        required: true,
        default: 0 // 默认值为0
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
},{collation: 'staff'})

module.exports = mongoose.model('Staff', staffSchema)