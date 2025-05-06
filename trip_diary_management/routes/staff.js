const express = require('express');
const router = express.Router();
const Staff = require('../db/mongodb/models/Staff');

// 系统人员登录
router.post('/login/:role', async (req, res) => {
    // 这里需要实现登录逻辑
    res.send('系统人员登录');
});

// 系统人员注册
router.post('/register/:role', async (req, res) => {
    try {
        const staff = new Staff({ ...req.body, role: req.params.role });
        await staff.save();
        res.status(201).send(staff);
    } catch (error) {
        res.status(400).send(error);
    }
});

// 获取当前系统人员信息
router.get('/me', async (req, res) => {
    // 这里需要实现获取当前系统人员逻辑
    res.send('当前系统人员信息');
});

// 更新系统人员信息
router.put('/me', async (req, res) => {
    try {
        const staff = await Staff.findByIdAndUpdate(req.staff._id, req.body, { new: true });
        res.send(staff);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;