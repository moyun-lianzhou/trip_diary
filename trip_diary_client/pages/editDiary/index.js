import request from '~/api/request';
Page({
    /**
     * 页面的初始数据
     */
    data: {
        diary: {
            diaryId:'',
            title: "",
            content: "",
            images: [],
            tags: [],
        },
        originFiles: [],
        // 图片布局
        gridConfig: {
            column: 4,
            width: 160,
            height: 160,
        },
        status:''
    },
    onLoad(options){
        const {diaryId, status} = options
        this.setData({status})
        this.initInfo(diaryId)
    },
    async initInfo(diaryId){
        const {diary}  = await request(`/diary/detail`, 'GET', {diaryId})
        diary.diaryId = diaryId
        this.setData({diary})

        const images = diary.images.map((img, idx)=>{
            return {
                url:img.url,
                name: `${idx}.${img.url.replace('/"/g', "").split('.')[1]}`,
                type:'image'
            }
        })
        this.setData({originFiles:images})
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

    // 编辑游记
    async editDiary() {
        wx.showLoading({
            title: "编辑中...",
            mask: true,
        });

        try {
            const userId = wx.getStorageSync('userId')
            const diaryId = this.data.diary.diaryId
            // 2. 提交表单数据
            const formData = {
                userId,
                diaryId,
                title: this.data.diary.title,
                content: this.data.diary.content,
                tags: this.data.tags
            };
            console.log('formData', formData)
            await request('/diary/edit', 'PUT', formData);
            wx.hideLoading();
                wx.showToast({
                    title: "编辑成功",
                    icon: "success"
                });
                console.log(this.data.status)
                setTimeout(() => wx.reLaunch({
                  url: `/pages/myDiary/index?status=${this.data.status}`,
                }), 1500);
           
        } catch (err) {
            console.log(err)
            wx.hideLoading();
            wx.showToast({
                title: "编辑失败",
                icon: "error"
            });
            // 这里可以添加失败后的清理逻辑
        }
    },
});