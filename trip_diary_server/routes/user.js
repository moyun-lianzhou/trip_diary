const express = require('express');
const router = express.Router();
const User = require('../db/mongodb/models/User');
// 导入上传中间件
const uploadSinglePhoto = require('../middlewares/uploadSingleFile'); 

// 获取当前用户信息
router.get('/info', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).send({
            code: 400,
            message: '缺少 userId 参数'
        });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({
                code: 404,
                message: '未找到该用户'
            });
        }
        const baseUrl = `http://${process.env.HOST}:${process.env.PORT}/`
        let avatarUrl = ''
        if(user.avatarUrl !== '/images/default_avatar.png'){
            avatarUrl = baseUrl + `/${userId}/avatar/${user.avatarUrl}`;
        }else{
            avatarUrl = baseUrl + `/${user.avatarUrl}`;
        }
        res.send({
            code: 200,
            data: {
                userInfo: {
                    username: user.username,
                    avatarUrl,
                    nickname: user.nickname,
                    gender: user.gender,
                    tip: user.tip,
                }
            }
        });
    } catch (error) {
        console.error('获取用户信息失败:', error);
        res.status(500).send({
            code: 500,
            message: '服务器内部错误'
        });
    }
});

// 更新用户信息-用户没有上传头像
router.put('/info', async (req, res) => {
    try {
        const userId = req.body.userId;

        const updateData = {
            ...req.body,
            updatedAt: Date.now(),
        };

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
        if (!user) {
            return res.status(404).send({
                code: 404,
                message: '未找到该用户'
            });
        }
        res.send({
            code: 200,
            data: user
        });
    } catch (error) {
        console.error('更新用户信息失败:', error);
        res.status(400).send({
            code: 400,
            message: '更新用户信息失败',
            error: error.message
        });
    }
});

// 更新用户信息-用户上传了头像
router.post('/info', uploadSinglePhoto.single('avatar'), async (req, res) => {
    try {
        console.log(req.file)
        const userId = req.body.userId;
        const updateData = {
            ...req.body,
            avatarUrl: req.file.filename, // 上传图片后的文件路径
            updatedAt: Date.now(),
        };

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
        if (!user) {
            return res.status(404).send({
                code: 404,
                message: '未找到该用户'
            });
        }
        res.send({
            code: 200,
            data: user
        });
    } catch (error) {
        console.error('更新用户信息失败:', error);
        res.status(400).send({
            code: 400,
            message: '更新用户信息失败',
            error: error.message
        });
    }
});

// 注销用户（管理员所有）
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send();
        }
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;