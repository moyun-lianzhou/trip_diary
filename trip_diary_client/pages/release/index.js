// pages/release/index.js
import {
    getImageDimension
} from "../../utils/getImageDimension"
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
    //   上传图片回调
    handleSuccess(e) {
        const {
            files
        } = e.detail;
        this.setData({
            originFiles: files,
        });
    },
    //   移除图片成功回调
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
    release() {
        console.log(this.data.diary);
        // wx.showLoading({
        //     title: "发布中...",
        //     mask: true,
        // });

        // 获取表单数据
        const formData = {
            title: "游记标题", // 需要替换为实际获取的标题
            content: "游记内容", // 需要替换为实际获取的内容
            images: Promise.all(this.data.originFiles.map(async (file) => {
                const dimensions = await getImageDimension(file.url);
                return {
                    url: file.url,
                    width: dimensions.width,
                    height: dimensions.height
                };
            })),
            tags: this.data.tags,
        };

        console.log(formData)
        return
        // 调用API发布游记
        wx.request({
            url: "http://localhost:3000/api/diary",
            method: "POST",
            data: formData,
            success: (res) => {
                wx.hideLoading();
                if (res.statusCode === 201) {
                    wx.showToast({
                        title: "发布成功",
                        icon: "success",
                        duration: 2000,
                    });
                    setTimeout(() => {
                        wx.reLaunch({
                            url: "/pages/home/index?oper=release",
                        });
                    }, 2000);
                } else {
                    wx.showToast({
                        title: "发布失败: " + res.data.message,
                        icon: "none",
                        duration: 3000,
                    });
                }
            },
            fail: (err) => {
                wx.hideLoading();
                wx.showToast({
                    title: "网络错误，请重试",
                    icon: "none",
                    duration: 3000,
                });
            },
        });
        // wx.reLaunch({
        //   url: `/pages/home/index?oper=release`,
        // });
    },
});