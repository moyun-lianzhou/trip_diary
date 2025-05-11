const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Diary = require('../db/mongodb/models/Diary');
const uploadManyPhoto = require('../middlewares/uploadManyPhoto'); // 导入上传中间件

// 获取所有人审核通过的游记列表（可分页、搜索）
router.get('/', async (req, res) => {
    try {
        console.log('Current env:', {
            PROTOCOL: process.env.PROTOCOL,
            HOST: process.env.HOST,
            PORT: process.env.PORT,
            BASE_URL: process.env.BASE_URL
          });
        console.log(process.env.BASE_URL)
        const diaries = await Diary.find({ status: 1, isDeleted: false });
        diaries.forEach(diary => {
            const authorId = diary.authorId;
            diary.images = diary.images.map(image => {
                image.url = `${process.env.BASE_URL}/${authorId}/diary_photos/${image.url}`; // 假设图片存储在 `public/imag`
                return image;
            });
        });
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

// 上传游记图片
router.post('/upload', uploadManyPhoto.array('photos', 20), async (req, res) => {
    try {
       
        const {width, height} = req.body;
        const files = req.files;
        console.log(width, height)
        const images = {
            url: files[0].filename,
            width: width,
            height: height
        };
        console.log(images)
        res.send(images);
    }catch (error) {
        res.status(500).send(error);
    }
})

// 创建游记
router.post('/create', uploadManyPhoto.array('photos', 20),async (req, res) => {
    try {
        const { images, title, content, userId, tags } = req.body;
        const diary = new Diary({
            authorId: userId,
            title,
            content,
            images,
            // tags: JSON.parse(tags),
            status: 1
        });

        await diary.save();
        res.status(200).json({ code: 200, data: diary });
    } catch (err) {
        // 回滚已上传的文件
        if(req.files?.length > 0) {
            req.files.forEach(file => {
                fs.unlinkSync(file.path);
            });
        }
        
        res.status(500).json({ code: 500, message: err.message });
    }


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