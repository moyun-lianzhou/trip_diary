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
            content: ""
        },
        originFiles: [],
        // 图片布局
        gridConfig: {
            column: 4,
            width: 160,
            height: 160,
        },
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
        const {files} = e.detail;
        if(files.length > 4){
            console.log('上传内容不能超过4个')
        }else{
            this.setData({originFiles: files});
        }
        console.log(this.data.originFiles)
    },
    handleRemove(e) {
        console.log('图片',this.data.originFiles)
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
    // 存入草稿箱
    saveDraft() {
        wx.reLaunch({
            url: `/pages/home/index?oper=save`,
        });
    },
    formIsValid(){
        const {title, content} = this.data.diary
        console.log(content)
        // return
        const images = this.data.originFiles.filter(file=>file.type === 'image')
        if(!images.length){
            wx.showToast({
                title: '请上传图片',
                icon:'error'
              })
            return false
        }
        if(!title || !content){
            wx.showToast({
                title: '请完善游记信息',
                icon:'error'
              })
            return false
        }
        return true
    },
    // 发布
    async release() {
        if(!this.formIsValid()) return
        // wx.showLoading({
        //     title: "发布中...",
        //     mask: true,
        // });
        console.log('开始上传...')
        console.log(this.data.originFiles)
        // 加入图片宽高
        const originFiles = await Promise.all(this.data.originFiles.map(async (file) => {
            console.log('进入。。。。', file)
            if(file.type === 'video') return file
            const dimension = await getImageDimension(file.url);
            file.width = dimension.width
            file.height = dimension.height
            return file
        }))
        console.log('计算图片宽高：',originFiles)

        try {
            const userId = wx.getStorageSync('userId')
            // 1. 上传所有图片
            const uploadResults = await Promise.all(
                originFiles.map(fileObj =>
                    new Promise((resolve, reject) => {
                        wx.uploadFile({
                            url: 'http://localhost:3000/api/diary/upload',
                            filePath: fileObj.url,
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
            const images = uploadResults.filter(file => !/\.(mp4)$/i.test(file.url));
            const videoResult = uploadResults.filter(file => /\.(mp4)$/i.test(file.url))[0];
            const video = videoResult ? videoResult.url : undefined;
            console.log('返回1', images)
            console.log('返回2', video)

            // 2. 提交表单数据
            const formData = {
                userId,
                title: this.data.diary.title,
                content: this.data.diary.content,
                images,
                tags: this.data.tags
            };
            // 只有当video不为undefined时才添加到formData中
            if (video !== undefined) {
                formData.video = video;
            }
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