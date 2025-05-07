import request from '~/api/request';
import useToastBehavior from '~/behaviors/useToast';



Page({
    behaviors: [useToastBehavior],
    data: {
        avatarUrl: '/static/default_avatar.png',
        isLogin: false,
        personalInfo: {},
        gridList: [{
                name: '全部发布',
                icon: 'root-list',
                type: 'all',
                url: '',
            },
            {
                name: '审核中',
                icon: 'search',
                type: 'progress',
                url: '',
            },
            {
                name: '已发布',
                icon: 'upload',
                type: 'published',
                url: '',
            },
            {
                name: '已拒绝',
                icon: 'file-copy',
                type: 'draft',
                url: '',
            },
        ],

        settingList: [{
                name: '联系客服',
                icon: 'service',
                type: 'service'
            },
            {
                name: '设置',
                icon: 'setting',
                type: 'setting',
                url: '/pages/setting/index'
            },
        ],
    },
    onChooseAvatar(e) {
        const {
            avatarUrl
        } = e.detail
        this.setData({
            avatarUrl,
        })
    },

    onLoad() {
        // 
    },

    async onShow() {
        const Token = wx.getStorageSync('access_token');
        const personalInfo = await this.getPersonalInfo();

        if (Token) {
            this.setData({
                isLoad: true,
                personalInfo,
            });
        }
    },

    async getPersonalInfo() {
        const info = await request('/api/genPersonalInfo').then((res) => res.data.data);
        return info;
    },

    onLogin(e) {
        console.log('sb')
        wx.navigateTo({
            url: '/pages/login/login',
          })
        // wx.login({
        //     timeout: 3000,
        //     success(res) {
        //         if (res.code) {
        //             //发起网络请求
        //             wx.request({
        //                 url: 'http://localhost:3000/api/auth/login',
        //                 method: 'POST',
        //                 data: {
        //                     code: res.code
        //                 },
        //                 success(res) {
        //                     console.log('登录成功', res.data)
        //                     this.isLogin = true
        //                     const {openid, userInfo} = res.data
        //                     console.log(openid, userInfo)
        //                 }
        //             })
        //         } else {
        //             console.log('登录失败！')
        //         }
        //     },
        //     fail(errMsg, errno) {
        //         console.log('接口调用失败111', errMsg, errno)
        //     }
        // })
    },

    onNavigateTo() {
        wx.navigateTo({
            url: `/pages/my/info-edit/index`
        });
    },

    onEleClick(e) {
        const {
            name,
            url
        } = e.currentTarget.dataset.data;
        if (url) return;
        this.onShowToast('#t-toast', name);
    },
});