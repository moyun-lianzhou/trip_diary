import request from '~/api/request';

Page({
    data: {
        usernameTip: '',
        passwordTip: '',
        passwordText: '密\u3000码',
        phoneNumber: '',
        isPhoneNumber: false,
        isSubmit: false,
        isPasswordLogin: true,
        formInfo: {
            username: '',
            password: '',
        },
        isCheck: false
    },
    // 手机号变更
    onPhoneInput(e) {
        const isPhoneNumber = /^[1][3,4,5,7,8,9][0-9]{9}$/.test(e.detail.value);
        this.setData({
            isPhoneNumber,
            phoneNumber: e.detail.value,
        });
        this.changeSubmit();
    },
    // 用户协议选择变更
    onCheckChange() {
        const isCheck = !this.data.isCheck
        this.setData({
            isCheck: isCheck
        });
        console.log(this.data.isCheck)
    },
    onAccountChange(e) {
        // 用户名验证：6位以上且包含字母和数字
        const usernameRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        if (!usernameRegex.test(e.detail.value)) {
            this.setData({ usernameTip: '用户名需6位以上且包含字母数字' })
            return;
        }
        this.setData({ usernameTip: '' })
        this.setData({ 'formInfo.username': e.detail.value });
    },
    onPasswordChange(e) {
        // 密码验证：6位以上
        if (e.detail.value.length < 6) {
            this.setData({ passwordTip: '密码需6位及以上' })
            return
        }
        this.setData({ passwordTip: '' })
        this.setData({ 'formInfo.password': e.detail.value });
    },
    // 切换登录方式
    changeLogin() {
        this.setData({ isPasswordLogin: !this.data.isPasswordLogin, isSubmit: false });
    },
    //验证表单是否可提交
    formIsValid() {
        console.log(this.data.formInfo)
        const { username, password } = this.data.formInfo
        const tips = {
            checkTip: '请勾选用户协议',
            otherTip: '请完善表单信息'
        }
        if (!this.data.isCheck) {
            wx.showToast({
                icon: 'none',
                duration: 2000,
                mask: true,
                title: tips.checkTip,
            })
            return false
        }
        if (!username || !password) {
            wx.showToast({
                icon: 'none',
                duration: 2000,
                mask: true,
                title: tips.otherTip,
            })
            return false
        }
        return true
    },

    async login() {
        // 表单验证是否通过
        if (!this.formIsValid()) return
        // 用户名密码登录
        if (this.data.isPasswordLogin) {
            wx.login({
                success: async (res) => {
                    if (!res.code) {
                        console.error('登录失败！' + res.errMsg)
                    }
                    //发起网络请求
                    try {
                        const result = await request('/auth/login', 'POST', { data: this.data.formInfo, code: res.code });
                        // 设置token
                        wx.setStorageSync('auth_token', result.auth_token);
                        wx.setStorageSync('userId', result.userInfo._id);
                        wx.showToast({
                            icon: 'success',
                            duration: 1000,
                            mask: true,
                            title: '登录成功',
                        })
                        setTimeout(() => {
                            wx.switchTab({
                                url: `/pages/my/index`,
                                success: () => {
                                    console.log('页面跳转成功');
                                },
                                fail: (err) => {
                                    console.error('页面跳转失败:', err);
                                }
                            });
                        }, 1000);
                    } catch (error) {
                        console.log('网络请求出错:', error);
                        wx.showToast({
                            icon: 'error',
                            duration: 2000,
                            mask: true,
                            title: error.data.message,
                        })
                        
                    }
                }
            })
        } else {
            // 手机号验证码登录
            const res = await request('/login/getSendMessage', 'get');
            if (res.success) {
                wx.navigateTo({
                    url: `/pages/loginCode/loginCode?phoneNumber=${this.data.phoneNumber}`,
                });
            }
        }
    },
});
