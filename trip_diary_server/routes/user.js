const express = require('express');
const router = express.Router();
const User = require('../db/mongodb/models/User');

// 获取当前用户信息
router.get('/me', async (req, res) => {
    // 这里需要实现获取当前用户逻辑
    res.send('当前用户信息');
});

// 更新用户信息
router.put('/me', async (req, res) => {
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