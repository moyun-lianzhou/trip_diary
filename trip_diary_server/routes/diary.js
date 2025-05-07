const express = require('express');
const router = express.Router();
const Diary = require('../db/mongodb/models/Diary');

// 获取所有人审核通过的游记列表（可分页、搜索）
router.get('/', async (req, res) => {
    try {
        const diaries = await Diary.find({ status: 'approved', isDeleted: false });
        res.send(diaries);
    } catch (error) {
        res.status(500).send(error);
    }
});

// 获取游记详情
router.get('/:id', async (req, res) => {
    try {
        const diary = await Diary.findById(req.params.id);
        if (!diary || diary.isDeleted) {
            return res.status(404).send();
        }
        res.send(diary);
    } catch (error) {
        res.status(500).send(error);
    }
});

// 获取当前用户的游记
router.get('/me', async (req, res) => {
    // 这里需要实现获取当前用户游记逻辑
    res.send('当前用户的游记');
});

// 创建游记
router.post('/', async (req, res) => {
    try {
        const diary = new Diary(req.body);
        await diary.save();
        res.status(201).send(diary);
    } catch (error) {
        res.status(400).send(error);
    }
});

// 更新游记
router.put('/:id', async (req, res) => {
    try {
        const diary = await Diary.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!diary || diary.isDeleted) {
            return res.status(404).send();
        }
        res.send(diary);
    } catch (error) {
        res.status(400).send(error);
    }
});

// 删除游记
router.delete('/:id', async (req, res) => {
    try {
        const diary = await Diary.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!diary) {
            return res.status(404).send();
        }
        res.send(diary);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;