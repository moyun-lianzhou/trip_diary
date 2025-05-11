// import Message from 'tdesign-miniprogram/message/index';
import request from '~/api/request';

Page({
    data: {
        enable: false,
        diaryList1: [],
        diaryList: [
            // {
            //     url: '/static/home/card0.png',
            //     desc: '少年,星空与梦想',
            //     tags: [{
            //             text: 'AI绘画',
            //             theme: 'primary',
            //         },
            //         {
            //             text: '版权素材',
            //             theme: 'success',
            //         },
            //     ],
            // },
            // {
            //     url: '/static/home/card1.png',
            //     desc: '仰望星空的少女',
            //     tags: [{
            //             text: 'AI绘画',
            //             theme: 'primary',
            //         },
            //         {
            //             text: '版权素材',
            //             theme: 'success',
            //         },
            //     ],
            // },
            // {
            //     url: '/static/home/card3.png',
            //     desc: '仰望星空的少年',
            //     tags: [{
            //             text: 'AI绘画',
            //             theme: 'primary',
            //         },
            //         {
            //             text: '版权素材',
            //             theme: 'success',
            //         },
            //     ],
            // },
            // {
            //     url: '/static/home/card2.png',
            //     desc: '少年,星空与梦想',
            //     tags: [{
            //             text: 'AI绘画',
            //             theme: 'primary',
            //         },
            //         {
            //             text: '版权素材',
            //             theme: 'success',
            //         },
            //     ],
            // },
            // {
            //     url: '/static/home/card4.png',
            //     desc: '多彩的天空',
            //     tags: [{
            //             text: 'AI绘画',
            //             theme: 'primary',
            //         },
            //         {
            //             text: '版权素材',
            //             theme: 'success',
            //         },
            //     ],
            // },
        ],
        // 发布
        motto: 'Hello World',
    },
    // 生命周期
    async onReady() {

    },
    async initInfo() {
        try {
            const {
                diaries
            } = await request('/diary', 'GET')
            for (const item of diaries) {
                console.log(item)
                const {
                    userInfo
                } = await request('/user/info', 'GET', {
                    userId: item.authorId
                });
                item.userInfo = userInfo
            }
            this.setData({
                diaryList1: diaries
            })
        } catch {

        }

        // console.log(res)


    },
    onLoad(option) {
        this.initInfo()
        // if (option.oper) {
        //   let content = '';
        //   if (option.oper === 'release') {
        //     content = '发布成功';
        //   } else if (option.oper === 'save') {
        //     content = '保存成功';
        //   }
        //   this.showOperMsg(content);
        // }
    },
    onRefresh() {
        // this.refresh();
    },
    async refresh() {

    },
    showOperMsg(content) {
        Message.success({
            context: this,
            offset: [120, 32],
            duration: 4000,
            content,
        });
    },
    goRelease() {
        wx.navigateTo({
            url: '/pages/release/index',
        });
    },
});