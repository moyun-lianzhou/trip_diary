// pages/release/index.js
import {
    getImageDimension
} from "~/utils/getImageDimension"
import request from '~/api/request';
Page({
    /**
     * 页面的初始数据
     */
    data: {
        diary: {
            title: "",
            content: "",
            images: [],
            tags: [],
        },
        originFiles: [

        ],
        // 图片布局
        gridConfig: {
            column: 4,
            width: 160,
            height: 160,
        },
        tags: ["风景", "饮食", "住宿", "交通"],
    },
    TitleChange(e) {
        this.setData({
            "diary.title": e.detail.value,
        });
    },
    ContentChange(e) {
        this.setData({
            "diary.content": e.detail.value,
        });
    },
    handleSuccess(e) {
        const {
            files
        } = e.detail;
        this.setData({
            originFiles: files,
        });
    },
    handleRemove(e) {
        const {
            index
        } = e.detail;
        const {
            originFiles
        } = this.data;
        originFiles.splice(index, 1);
        this.setData({
            originFiles,
        });
    },
    handleClick(e) {
        console.log(e.detail.file);
    },
    // 获取当前位置
    gotoMap() {
        wx.showToast({
            title: "获取当前位置...",
            icon: "none",
            image: "",
            duration: 1500,
            mask: false,
            success: () => {},
            fail: () => {},
            complete: () => {},
        });
    },
    // 存入草稿箱
    saveDraft() {
        wx.reLaunch({
            url: `/pages/home/index?oper=save`,
        });
    },

    // 发布
    async release() {
        wx.showLoading({
            title: "发布中...",
            mask: true,
        });

        // 加入图片宽高
        const originFiles = await Promise.all(this.data.originFiles.map(async (file) => {
            const dimension = await getImageDimension(file.url);
            return {
                file,
                width: dimension.width,
                height: dimension.height
            };
        }))

        try {
            const userId = wx.getStorageSync('userId')
            // 1. 上传所有图片
            const uploadResults = await Promise.all(
                originFiles.map(fileObj =>
                    new Promise((resolve, reject) => {
                        wx.uploadFile({
                            url: 'http://localhost:3000/api/diary/upload',
                            filePath: fileObj.file.url,
                            name: 'photos',
                            formData: {
                                userId: userId,
                                width: fileObj.width,
                                height: fileObj.height
                            },
                            success: (res) => {
                                try {
                                    const data = res.data ? JSON.parse(res.data) : null;
                                    resolve(data);
                                } catch (e) {
                                    reject(e);
                                }
                            },
                            fail: reject
                        });
                    })
                )
            );

            console.log('返回', uploadResults)
            // 2. 提交表单数据
            const formData = {
                userId,
                title: this.data.diary.title,
                content: this.data.diary.content,
                images: uploadResults,
                tags: this.data.tags
            };
            console.log('sb2')
            console.log('formData', formData)

            await request('/diary/create', 'POST', formData);

            wx.hideLoading();
            
                wx.showToast({
                    title: "发布成功",
                    icon: "success"
                });

                setTimeout(() => wx.reLaunch({
                    url: "/pages/home/index"
                }), 2000);
           
        } catch (err) {
            console.log(err)
            wx.hideLoading();
            wx.showToast({
                title: "发布失败，已回滚",
                icon: "none"
            });
            // 这里可以添加失败后的清理逻辑
        }
    },
});