import request from '~/api/request';

Page({
  data: {
      usernameTip:'',
      passwordTip:'',
    passwordText: '密\u3000码',
    phoneNumber: '',
    isPhoneNumber: false,
    isCheck: false,
    isSubmit: false,
    isPasswordLogin: true,
    passwordInfo: {
      account: '',
      password: '',
    },
    radioValue: '',
  },

  /* 自定义功能函数 */
  changeSubmit() {
    if (this.data.isPasswordLogin) {
      if (this.data.passwordInfo.account !== '' && this.data.passwordInfo.password !== '' && this.data.isCheck) {
        this.setData({ isSubmit: true });
      } else {
        this.setData({ isSubmit: false });
      }
    } else if (this.data.isPhoneNumber && this.data.isCheck) {
      this.setData({ isSubmit: true });
    } else {
      this.setData({ isSubmit: false });
    }
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
  onCheckChange(e) {
    const { value } = e.detail;
    this.setData({
      radioValue: value,
      isCheck: value === 'agree',
    });
    this.changeSubmit();
  },

  onAccountChange(e) {
      // 用户名验证：6位以上且包含字母和数字
  const usernameRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  if (!usernameRegex.test(e.detail.value)) {
      this.setData({usernameTip:'用户名需6位以上且包含字母数字'})
      this.usernameTip = '用户名需6位以上且包含字母数字'
    // wx.showToast({
    //   title: '用户名需6位以上且包含字母数字',
    //   icon: 'none'
    // });
    return;
  }else{
    this.setData({usernameTip:''})
  }
    // console.log(e.detail)
    this.setData({ passwordInfo: { ...this.data.passwordInfo, account: e.detail.value } });
    // this.changeSubmit();
  },

  onPasswordChange(e) {
    // 密码验证：6位以上
  if (e.detail.value.length <= 6) {
    this.setData({passwordTip:'密码需6位以上'})
    // wx.showToast({
    //   title: '密码需6位以上',
    //   icon: 'none'
    // });
    // return;
  }else{
    this.setData({passwordTip:''})
  }
    this.setData({ passwordInfo: { ...this.data.passwordInfo, password: e.detail.value } });
    // this.changeSubmit();
  },

  // 切换登录方式
  changeLogin() {
    this.setData({ isPasswordLogin: !this.data.isPasswordLogin, isSubmit: false });
  },

  async login() {
    // 用户名密码登录
    if (this.data.isPasswordLogin) {
      const res = await request('/login/postPasswordLogin', 'post', { data: this.data.passwordInfo });
      if (res.success) {
        await wx.setStorageSync('access_token', res.data.token);
        wx.switchTab({
          url: `/pages/my/index`,
        });
      }
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
