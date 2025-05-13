import request from '~/api/request';

Page({
    data: {
        userInfo: {},
        photoList: [],
        genderOptions: [{
                label: '保密',
                value: 0,
            },
            {
                label: '男',
                value: 1,
            },
            {
                label: '女',
                value: 2,
            }
        ],
        gridConfig: {
            column: 3,
            width: 160,
            height: 160,
        },
    },

    onLoad() {
        this.getUserInfo();
    },

    getUserInfo() {
        const userId = wx.getStorageSync('userId')
        request('/user/info', 'GET', {
            userId
        }).then((res) => {
            this.setData({
                userInfo: res.userInfo
            });
            this.setData({
                photoList: [{
                    url: res.userInfo.avatarUrl,
                    name: 'avatar.png',
                    type: 'image',
                    removeBtn: true,
                }]
            })
        });
    },

    userInfoFieldChange(field, e) {
        const {value} = e.detail
        this.setData({
            [`userInfo.${field}`]: value,
        });
    },

    onGenderChange(e) {
        this.userInfoFieldChange('gender', e);
    },

    onTipChange(e) {
        this.userInfoFieldChange('tip', e);
    },

    onNicknameChange(e) {
        this.userInfoFieldChange('nickname', e)
    },

    onPhotoRemove(e) {
        const {
            index
        } = e.detail;
        const {
            photoList
        } = this.data;
        // 移除这张图片并更新图片列表
        photoList.splice(index, 1);
        this.setData({
            photoList: photoList,
        });
    },
    onPhotoAdd(e) {
        // 添加图片事件回调
        const {
            files
        } = e.detail;
        this.setData({
            photoList: files
        });
    },
    onSaveInfo() {
        if (!this.data.userInfo.nickname) {
            wx.showToast({
                icon: 'none',
                duration: 2000,
                mask: true,
                title: '请输入昵称',
            })
            return
        }
        const userId = wx.getStorageSync('userId')
        const userInfo = {
            ...this.data.userInfo,
            userId
        }; // 确保包含
        delete userInfo.avatarUrl // 隔离头像的影响，防止修改数据库数据
        // 没有上传头像
        const photoList = this.data.photoList
        if (!photoList.length || photoList[0].url === this.data.userInfo.avatarUrl) {
            console.log('提交的用户信息：',this.data.userInfo)
            request('/user/info', 'PUT', userInfo).then((res) => {
                wx.showToast({
                    icon: 'success',
                    duration: 1000,
                    mask: true,
                    title: '修改成功',
                })
                setTimeout(() => {
                    wx.switchTab({
                        url: `/pages/my/index`,
                    });
                }, 1000)
            });
        } else {
            this.onUpload(this.data.photoList[0], userInfo);
        }

    },
    onUpload(file, userInfo) {
        const {
            photoList
        } = this.data;
        this.setData({
            photoList: [...photoList, {
                ...file,
                status: 'loading'
            }]
        });
        console.log('提交的用户信息：',this.data.userInfo)
        const {length} = photoList;
        wx.uploadFile({
            url: 'http://localhost:3000/api/user/info',
            formData: userInfo,
            filePath: file.url,
            name: 'avatar',
            success: () => {
                this.setData({
                    [`photoList[${length}].status`]: 'done',
                });

                wx.showToast({
                    icon: 'success',
                    duration: 1000,
                    mask: true,
                    title: '修改成功',
                })
                setTimeout(() => {
                    wx.switchTab({
                        url: `/pages/my/index`,
                    });
                }, 1000)
            },
        });
    },
});