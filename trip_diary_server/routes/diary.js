const express = require('express');
const router = express.Router();
const Diary = require('../db/mongodb/models/Diary');
const uploadManyPhoto = require('../middlewares/uploadManyPhoto'); // 导入上传中间件

// 获取所有人审核通过的游记列表（可分页、搜索）
router.get('/', async (req, res) => {
    try {
        const diaries = await Diary.find({ status: 1, isDeleted: false });
        res.send({
            code: 200,
            data: {
                diaries
            }
        });
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
router.post('/create', uploadManyPhoto.array('photos', 20),async (req, res) => {
    if (!req.files || req.files.length === 0){
        return res.status(401).send({
            code: 401,
            message: '没有照片上传'
        });
    }

    let { photoMeta } = req.body;


    // try {
    //     // 定义 mock 数据
    //     const mockDiaries = [
    //         {
    //             title: "第一次旅行",
    //             content: "这是我第一次旅行，去了美丽的海边城市，看到了壮丽的海景。",
    //             images: ["http://localhost:3000//681ccb31039ea087802bccf9/avatar/e75ed626-62de-421a-b74f-8369eae5c92e.jpg", "http://localhost:3000//681ccb31039ea087802bccf9/avatar/e75ed626-62de-421a-b74f-8369eae5c92e.jpg"],
    //             video: "https://example.com/video.mp4",
    //             authorId: "654321abcdef123456789012", // 请替换为实际的用户 ID
    //             status: 0,
    //             checkedName: "李审核",
    //             checkedAt: new Date(),
    //             rejectReason: "",
    //             isDeleted: 0
    //         },
    //         {
    //             title: "山区探险",
    //             content: "这次去了山区，体验了徒步旅行，感受到了大自然的魅力。",
    //             images: ["http://localhost:3000//681ccb31039ea087802bccf9/avatar/e75ed626-62de-421a-b74f-8369eae5c92e.jpg", "http://localhost:3000//681ccb31039ea087802bccf9/avatar/e75ed626-62de-421a-b74f-8369eae5c92e.jpg"],
    //             video: "https://example.com/video2.mp4",
    //             authorId: "654321abcdef123456789013", // 请替换为实际的用户 ID
    //             status: 0,
    //             checkedName: "张审核",
    //             checkedAt: new Date(),
    //             rejectReason: "",
    //             isDeleted: 0
    //         }
    //     ];

    //     // 插入 mock 数据到数据库
    //     for (const mockDiary of mockDiaries) {
    //         const diary = new Diary(mockDiary);
    //         await diary.save();
    //     }

    //     res.status(201).send({ message: "Mock 数据插入成功", insertedCount: mockDiaries.length });
    // } catch (error) {
    //     res.status(400).send(error);
    // }
    // try {
    //     const diary = new Diary(req.body);
    //     await diary.save();
    //     res.status(201).send(diary);
    // } catch (error) {
    //     res.status(400).send(error);
    // }
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