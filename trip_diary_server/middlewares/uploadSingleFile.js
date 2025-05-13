const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid');


// 创建上传目录（如果不存在）
const baseDir = path.join(__dirname, '..', 'upload');
if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
}

// 设置文件存储路径和文件名
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.body.userId; // 获取用户 ID
        if (!userId) return cb(new Error('缺少 userId'), null);
        const avatarUrl = path.join(baseDir, userId, 'avatar'); // 头像存储路径
        const avatarFolder = path.join(__dirname, '..', 'upload', userId, 'avatar');
        // 检查 avatar 文件夹是否存在，不存在则创建
        if (!fs.existsSync(avatarUrl)) {
            fs.mkdirSync(avatarUrl, { recursive: true });
        }
        // 删除文件夹下所有文件
        fs.readdirSync(avatarFolder).forEach(file => {
            const filePath = path.join(avatarFolder, file);
            fs.unlinkSync(filePath);
        });
        cb(null, avatarUrl); // 文件存储路径
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + path.extname(file.originalname)); // 文件名
    }
});

// 初始化上传中间件
const uploadMiddleware = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'video/mp4') {
            cb(null, true); // 接受文件
        } else {
            cb(new Error('只允许上传 JPG/PNG/mp4 文件'), false); // 拒绝文件
        }
    },
    limits: { fileSize: 20 * 1024 * 1024 } // 限制文件大小为 20MB
});

module.exports = uploadMiddleware

