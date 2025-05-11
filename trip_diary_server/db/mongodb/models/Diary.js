const mongoose = require('mongoose')
// 定义数据模型
const diarySchema = new mongoose.Schema({
    title: { // 标题
        type: String,
        required: true,
    },
    content: { // 内容
        type: String,
        required: true,
    },
    images: { // 图片URL数组
        type: [String], // 数组类型，每个元素都是字符串类型的URL
        required: true, 
    },
    video: String, // 视频URL
    authorId: { // 作者ID（关联User表）
        type: mongoose.Schema.Types.ObjectId, // 关联User表的ObjectId
        ref: 'User', // 关联的模型名称为User
        required: true, 
    },
    status: { // 状态，0为待审核，1为通过审核，2为未通过审核
        type: Number, // 数字类型，0、1或2
        required: true, 
        default: 0 // 默认值为0
    },
    checkedName:  String, // 字符串类型的姓名，仅当状态为1或2时存在
    rejectReason: String,// 拒绝原因（仅当状态为2时存在）
    checkedAt: { // 审核时间
        type: Date, // 日期类型
        required: true, 
        default: Date.now // 默认值为当前时间
    },
    isDeleted: { // 是否删除，0为未删除，1为已删除
        type: Number, // 数字类型，0或1
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
}, {collection: 'diary'})

module.exports = mongoose.model('Diary', diarySchema)