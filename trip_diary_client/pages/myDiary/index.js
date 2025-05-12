// pages/myDiary.js
import request from '~/api/request';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    diaryList: [],
    statusMap: {
        '0': '审核中',
        '1': '已发布',
        '2': '已拒绝',
        'all': '全部发布'
    },
    status:''
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { status } = options;
    console.log('接收到的状态:', status);
    this.setData({status})
    this.loadDiaries(status);
    console.log('接收到的状态status:', this.data.status)
  },
  async loadDiaries(status) {
    const userId = wx.getStorageSync('userId')
    const all = status === 3 ? true : false
    const res = await request('/diary/my', 'GET', {
        all,
        status,
        userId
    });
    this.setData({ diaryList: res.diaries });
},
    goRelease(){
        wx.redirectTo({
            url: '/pages/release/index' // 确保这是发布页面的实际路径
        });
    },
    deleteDiary(event){
    const diaryId = event.currentTarget.dataset.id; // 获取游记ID
    const status = this.data.status
    console.log(diaryId)
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这篇游记吗？',
      success: async (res) => {
        if (res.confirm) {
            try{
                await request(`/diary/delete?diaryId=${diaryId}`, 'DELETE')
                this.loadDiaries(status); // 重新加载游记列表
                wx.showToast({
                    title: '删除成功',
                    icon: 'success'
                  }); 
            }catch(error){
                wx.showToast({
                    title: '删除失败',
                    icon: 'none'
                  });
                console.log(error)
            }
            
        }
      }
    });
    },
    editDiary(event){
        const diaryId = event.currentTarget.dataset.id; // 获取游记ID
        wx.navigateTo({
          url: `/pages/editDiary/index?diaryId=${diaryId}&status=${this.data.status}`,
        })
    },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})