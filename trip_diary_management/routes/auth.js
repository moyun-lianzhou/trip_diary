const express = require('express');
const router = express.Router();
const User = require('../db/mongodb/models/User');

// 用户注册
router.post('/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

// 用户登录
router.post('/login', async (req, res) => {
    // 这里需要实现登录逻辑，如验证用户名和密码
    res.send('用户登录');
});
// 用户登录
router.get('/login', async (req, res) => {
    // 这里需要实现登录逻辑，如验证用户名和密码
    res.send('用户登录');
});


module.exports = router;