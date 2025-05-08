const express = require('express');
const router = express.Router();
const User = require('../db/mongodb/models/User');

// 获取当前用户信息
// 获取当前用户信息
router.get('/info', async (req, res) => {
    const {userId} = req.query;

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
        res.send({
            code: 200,
            data:{
                userInfo: {
                    username: user.username,
                    avatarUrl: `http://${process.env.HOST}:${3000}/${user.avatarUrl}`,
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

// 更新用户信息
router.put('/info', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
        res.send(user);
    } catch (error) {
        res.status(400).send(error);
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