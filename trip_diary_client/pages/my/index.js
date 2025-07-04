import request from '~/api/request';
import useToastBehavior from '~/behaviors/useToast';



Page({
    behaviors: [useToastBehavior],
    data: {
        userInfo: {
            username: '',
            nickname: '未登录',
            avatarUrl: '/static/default_avatar.png',
            tip: '用户太懒，暂无介绍',
            gender: 0,
            city:'未知'
        },
        avatarUrl: '/static/default_avatar.png',
        isLogin: false,
        personalInfo: {},
        gridList: [{
                name: '全部游记',
                icon: 'root-list',
                type: 'all',
                status: 3
            },
            {
                name: '审核中',
                icon: 'search',
                type: 'progress',
                status: 0
            },
            {
                name: '已发布',
                icon: 'upload',
                type: 'published',
                status: 1
            },
            {
                name: '已拒绝',
                icon: 'file-copy',
                type: 'draft',
                status: 2
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
            },
            {
                name: '退出登录',
                icon: 'poweroff',
                type: 'logout'
            }
        ],
    },
    onChooseAvatar(e) {
        const {avatarUrl} = e.detail
        this.setData({avatarUrl})
    },
    async getUserInfo() {
        const userId = wx.getStorageSync('userId')
        const userInfo = await request('/user/info', 'GET', {userId}).then((res) => res.userInfo);
        return userInfo
    },
    onLoad() {

    },
    onShow() {
        const token = wx.getStorageSync('auth_token');
        if (token) {
            this.setData({
                isLogin: true,
            });
            this.getUserInfo().then(res => {
                console.log('sb', res)
                this.setData({
                    userInfo: {
                        username: res.username,
                        nickname: res.nickname,
                        avatarUrl: res.avatarUrl,
                        tip: res.tip,
                        gender: res.gender
                    }
                })
            })
        }
    },
    onLogin(e) {
        console.log('sb')
        wx.navigateTo({
            url: '/pages/login/login',
        })
    },

    onNavigateTo() {
        wx.navigateTo({
            url: `/pages/my/info-edit/index`
        });
    },
    
    goDiaryPage(e){
        const {status} = e.currentTarget.dataset.data;
        wx.navigateTo({
          url: `/pages/myDiary/index?status=${status}`,
        })
    },

    onEleClick(e) {
        const { type, name } = e.currentTarget.dataset.data;

            if (type === 'logout') {
                wx.showModal({
                    title: '提示',
                    content: '确定要退出登录吗？',
                    confirmText: '退出',
                    success: (res) => {
                        if (res.confirm) {
                            wx.removeStorageSync('auth_token');
                            wx.removeStorageSync('userId');
                            this.setData({
                                isLogin: false,
                                userInfo: {
                                    username: '',
                                    nickname: '未登录',
                                    avatarUrl: '/static/default_avatar.png',
                                    tip: '用户太懒，暂无介绍',
                                    gender: 0,
                                    city: '未知'
                                }
                            });
                        }
                    }
                });
            } else if (url) {
                wx.navigateTo({ url });
            } else {
                wx.showToast({
                    title: name,
                    icon: 'none'
                });
            }
    },
});