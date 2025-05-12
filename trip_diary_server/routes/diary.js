const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Diary = require('../db/mongodb/models/Diary');
const uploadManyPhoto = require('../middlewares/uploadManyPhoto'); // 导入上传中间件
const User = require('../db/mongodb/models/User');

// 获取所有人审核通过的游记列表-不分页
router.get('/', async (req, res) => {
    try {
        const diaries = await Diary.find({ status: 1, isDeleted: false })
            .populate({
                path: 'authorId',
                select: 'nickname avatarUrl',
                transform: doc => ({
                    userId: doc._id,
                    nickname: doc.nickname,
                    avatarUrl: `${process.env.BASE_URL}/${doc._id}/avatar/${doc.avatarUrl}`
                })
            })
            .lean();

        // 转换数据结构
        const processedDiaries = diaries.map(diary => {
            const userInfo = diary.authorId;
            delete diary.authorId;
            
            return {
                ...diary,
                userInfo,
                images: diary.images.map(image => ({
                    ...image,
                    url: `${process.env.BASE_URL}/${userInfo.userId}/diary_photos/${image.url}`
                }))
            };
        });

        res.send({
            code: 200,
            data: {
                diaries: processedDiaries
            }
        });
    } catch (error) {
        console.error('获取游记列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器内部错误'
        });
    }
});


// 分页返回已通过审核的diary,每页10条，前端小程序无限加载，每次上拉刷新后加载10条diary数据
router.get('/page', async (req, res) => {
    try {
        const { currentPage = 1, limit = 10 } = req.query; // 从查询参数中获取页码和每页数量
        const skip = (currentPage - 1) * limit;

        // 获取总数用于分页计算
        const total = await Diary.countDocuments({ 
            status: 1, 
            isDeleted: false 
        });

        // 查询当前页数据
        const diaries = await Diary.find({ status: 1, isDeleted: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'authorId',
            select: 'nickname avatarUrl',
            transform: doc => ({
                userId: doc._id,
                nickname: doc.nickname,
                avatarUrl: `${process.env.BASE_URL}/${doc._id}/avatar/${doc.avatarUrl}`
            })
        })
        .lean();

        

        // const diary = await Diary.findById(diaryId)
        // .populate({
        //     path: 'authorId',
        //     select: 'nickname avatarUrl',
        //     transform: doc => ({
        //         userId: doc._id,
        //         nickname: doc.nickname,
        //         avatarUrl: `${process.env.BASE_URL}/${doc._id}/avatar/${doc.avatarUrl}`
        //     })
        // })
        // .lean();
        

        // 处理图片URL
        diaries.forEach(diary => {
            const userInfo = diary.authorId;
            const authorId = diary.authorId.userId;
            delete diary.authorId;
            diary.images = diary.images.map(image => {
                image.url = `${process.env.BASE_URL}/${authorId}/diary_photos/${image.url}`;
                return image;
            });
            diary.userInfo = userInfo;
        });

        res.send({
            code: 200,
            data: {
                total,
                currentPage: parseInt(currentPage),
                pages: Math.ceil(total / limit),
                diaries
            }
        });
    } catch (error) {
        console.error('获取分页数据失败:', error);
        res.status(500).send({
            code: 500,
            message: '服务器内部错误'
        });
    }
});


// 根据游记的id获取游记详情
router.get('/detail', async (req, res) => {
    try {
        const diaryId = req.query.diaryId;
        console.log(diaryId)
        
        
        // 验证ID格式
        if (!mongoose.Types.ObjectId.isValid(diaryId)) {
            return res.status(400).json({ 
                code: 400,
                message: '无效的游记ID格式'
            });
        }

        // 查询数据库
        const diary = await Diary.findById(diaryId)
            .populate({
                path: 'authorId',
                select: 'nickname avatarUrl',
                transform: doc => ({
                    userId: doc._id,
                    nickname: doc.nickname,
                    avatarUrl: `${process.env.BASE_URL}/${doc._id}/avatar/${doc.avatarUrl}`
                })
            })
            .lean();

        // 处理查询结果
        if (!diary || diary.isDeleted === 1) {
            return res.status(404).json({
                code: 404,
                message: '未找到该游记'
            });
        }

        // 处理图片URL
        diary.images = diary.images.map(image => ({
            ...image,
            url: `${process.env.BASE_URL}/${diary.authorId.userId}/diary_photos/${image.url}`
        }));
        const userInfo = diary.authorId
        delete diary.authorId

        res.json({
            code: 200,
            data: {
                diary: {
                    ...diary,
                    userInfo
                }
            }
        });

    } catch (error) {
        console.error('获取游记详情失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器内部错误'
        });
    }
});

// 获取当前用户的游记-根据用户ID获取
// 验证一个参数all，all为true时，返回所有状态的游记
// 否则，判断status为0/1/2的游记，0为未审核，1为审核通过，2为审核未通过，并且isDeleted为false的游记
// 根据status和isDeleted的不同组合，返回不同的状态码和数据
// 如果isDeleted为true，那么就返回404，否则返回200
router.get('/my', async (req, res) => {
    try {
        const { userId:authorId, status } = req.query;
        
        
        // 构建查询条件
        const query = { authorId };
        if (status !== '3') {
            query.status = status;
            query.isDeleted = 0;
        }

        // 查询数据
        const [diaries, total] = await Promise.all([
            Diary.find(query)
                .sort({ createdAt: -1 })
                .populate({
                    path: 'authorId',
                    select: 'nickname avatarUrl',
                    transform: doc => ({ 
                        userId: doc._id,
                        nickname: doc.nickname,
                        avatarUrl: doc.avatarUrl
                    })
                }).lean(),
            Diary.countDocuments(query)
        ]);

        // 处理图片URL
        // 转换字段结构
        const processedDiaries = diaries.map(diary => {
            const userInfo = diary.authorId;
            delete diary.authorId;
            
            return {
                ...diary,
                userInfo,
                images: diary.images.map(image => ({
                    ...image,
                    url: `${process.env.BASE_URL}/${userInfo.userId}/diary_photos/${image.url}`
                }))
            };
        });

        // 构建响应数据
        const response = {
            code: 200,
            data: {
                diaries: processedDiaries
            }
        };

        // 处理删除状态
        if (diaries.some(d => d.isDeleted)) {
            response.code = 404;
            response.message = '包含已删除的游记';
        }

        res.status(response.code).send(response);

    } catch (error) {
        console.error('获取用户游记失败:', error);
        res.status(500).send({
            code: 500,
            message: '服务器内部错误'
        });
    }
});


// 搜索路由-根据keyWord模糊查询title和nickname
router.get('/search', async (req, res) => {
        // 先判断是否满足title模糊查询条件
        // 在查询用户集合，判断keyWord是否在nickname中
        try {
            const { keyWord, page = 1, limit = 10 } = req.query;
            
            if (!keyWord) {
                return res.status(400).send({
                    code: 400,
                    message: '缺少搜索关键词'
                });
            }
    
            // 1. 查询标题匹配的游记
            const titleDiaries = await Diary.find({
                title: { $regex: keyWord, $options: 'i' },
                status: 1,
                isDeleted: false
            });
    
            // 2. 查询昵称匹配的用户
            const users = await User.find({
                nickname: { $regex: keyWord, $options: 'i' }
            });
            
            // 3. 获取这些用户的游记
            const userDiaries = await Diary.find({
                authorId: { $in: users.map(u => u._id) },
                status: 1,
                isDeleted: false
            });
    
            // 合并结果并去重
            const allDiaries = [...titleDiaries, ...userDiaries];
            const uniqueDiaries = [...new Map(allDiaries.map(diary => 
                [diary._id.toString(), diary])).values()];
    
            // 分页处理
            const start = (page - 1) * limit;
            const end = start + limit;
            const pagedDiaries = uniqueDiaries.slice(start, end);
    
            // 处理图片URL
            pagedDiaries.forEach(diary => {
                const authorId = diary.authorId;
                diary.images = diary.images.map(image => {
                    image.url = `${process.env.BASE_URL}/${authorId}/diary_photos/${image.url}`;
                    return image;
                });
            });
    
            res.send({
                code: 200,
                data: {
                    total: uniqueDiaries.length,
                    diaries: pagedDiaries
                }
            });
        } catch (error) {
            console.error('搜索失败:', error);
            res.status(500).send({
                code: 500,
                message: '服务器内部错误'
            });
        }
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
            status: 0
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
});

// 更新游记
router.put('/edit', uploadManyPhoto.array('photos', 20),async (req, res) => {
    try {
        const { title, content, images, diaryId, userId} = req.body;
        console.log(req.body)
        // 验证ID格式
        if (!mongoose.Types.ObjectId.isValid(diaryId)) {
            return res.status(400).json({
                code: 400,
                message: '无效的游记ID格式'
            });
        }

        // 查询原始游记
        const originalDiary = await Diary.findById(diaryId);
        console.log(originalDiary)
        if (!originalDiary || originalDiary.isDeleted) {
            return res.status(404).json({
                code: 404,
                message: '未找到该游记'
            });
        }

        // 权限验证：仅允许作者修改
        if (originalDiary.authorId.toString() !== userId) {
            return res.status(403).json({
                code: 403,
                message: '无权修改该游记'
            });
        }

        // 状态验证：仅允许修改待审核(0)和未通过(2)状态的游记
        if (![0, 2].includes(originalDiary.status)) {
            return res.status(400).json({
                code: 400,
                message: '当前状态不可修改'
            });
        }

        // 构建更新数据（排除不可修改字段）
        const updateData = {
            title: title || originalDiary.title,
            content: content || originalDiary.content,
            images: images || originalDiary.images,
            updatedAt: new Date()
        };

        // 执行更新
        const updatedDiary = await Diary.findByIdAndUpdate(diaryId, updateData, {
            new: true,
            runValidators: true
        }).populate({
            path: 'authorId',
            select: 'nickname avatarUrl',
            transform: doc => ({
                userId: doc._id,
                nickname: doc.nickname,
                avatarUrl: `${process.env.BASE_URL}/${doc._id}/avatar/${doc.avatarUrl}`
            })
        }).lean();

        // 处理图片URL
        updatedDiary.images = updatedDiary.images.map(image => ({
            ...image,
            url: `${process.env.BASE_URL}/${updatedDiary.authorId._id}/diary_photos/${image.url}`
        }));

        res.json({
            code: 200,
            data: {
                diary: {
                    ...updatedDiary,
                    userInfo: updatedDiary.authorId
                }
            }
        });

    } catch (error) {
        console.error('更新游记失败:', error);
        res.status(500).json({
            code: 500,
            message: error.message || '服务器内部错误'
        });
    }
});

// 删除游记
// 实现游记编辑、删
// 除功能。待审核、
// 未 通 过 状 态 可 编
// 辑，所有状态游记
// 可删除（物理删除
// 即可）
// 删除游记（物理删除）
router.delete('/delete', async (req, res) => {
    try {
        const { diaryId } = req.query;

        // 验证ID格式
        if (!mongoose.Types.ObjectId.isValid(diaryId)) {
            return res.status(400).json({
                code: 400,
                message: '无效的游记ID格式'
            });
        }

        // 执行物理删除
        const result = await Diary.deleteOne({ _id: diaryId });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                code: 404,
                message: '未找到要删除的游记'
            });
        }

        res.json({
            code: 200,
            message: '游记删除成功',
            data: {
                deletedId: diaryId
            }
        });

    } catch (error) {
        console.error('删除游记失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器内部错误'
        });
    }
});

module.exports = router;