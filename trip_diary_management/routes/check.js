const express = require('express');
const router = express.Router();
const Diary = require('../db/mongodb/models/Diary');

// 获取所有游记（包括待审核、通过、未通过）
router.get('/diary', async (req, res) => {
    try {
        const diaries = await Diary.find({ isDeleted: false });
        res.send(diaries);
    } catch (error) {
        res.status(500).send(error);
    }
});

// 获取不同状态的游记
router.get('/diary/:status', async (req, res) => {
    try {
        const diaries = await Diary.find({ status: req.params.status, isDeleted: false });
        res.send(diaries);
    } catch (error) {
        res.status(500).send(error);
    }
});

// 通过游记
router.put('/diary/:id/approve', async (req, res) => {
    try {
        const diary = await Diary.findByIdAndUpdate(req.params.id, {
            status: 'approved',
            checkedName: req.staff.name,
            checkedAt: new Date()
        }, { new: true });
        if (!diary || diary.isDeleted) {
            return res.status(404).send();
        }
        res.send(diary);
    } catch (error) {
        res.status(400).send(error);
    }
});

// 拒绝游记
router.put('/diary/:id/reject', async (req, res) => {
    try {
        const diary = await Diary.findByIdAndUpdate(req.params.id, {
            status: 'rejected',
            checkedName: req.staff.name,
            checkedAt: new Date(),
            rejectReason: req.body.rejectReason
        }, { new: true });
        if (!diary || diary.isDeleted) {
            return res.status(404).send();
        }
        res.send(diary);
    } catch (error) {
        res.status(400).send(error);
    }
});

// 逻辑删除游记
router.delete('/diary/:id', async (req, res) => {
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