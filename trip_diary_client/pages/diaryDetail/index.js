// pages/diaryDetail/index.js
import request from "~/api/request";

Page({

    data: {
        diary: {},
        previewImgUrls:[],
        swiperList:[],
        indicatorDots: true,
        autoplay: false, // 自动播放
        interval: 1000, //轮播时间
        duration: 300, // 滑动速度越大越慢
        circular: true, //是否循环
        beforeColor: "lightgray", //指示点颜色
        afterColor: "#ffffff", //当前选中的指示点颜色
        controls: false, // 轮播数据 + 效果 E
    },
    //预览图片
    previewImage: function (e) {
        const  current = e.target.dataset.src;
        wx.previewImage({
            current: current,
            urls: this.data.previewImgUrls,
        });
    },
    // 播放
    videoPlay: function () {
        console.log("开始播放");
        const videoContext = wx.createVideoContext("myVideo");
        // 全屏播放
        videoContext.requestFullScreen({direction:0});
        videoContext.play();
        this.setData({
            controls: true,
        });
    },
    

    async getDiaryDetail(diaryId) {
        const { diary } = await request("/diary/detail", "GET", { diaryId });
        const d1 = diary.content
        console.log(diary.content)
        diary.content = diary.content.replace(/↵/g, "\n");
        const d2 = diary.content
        console.log(diary.content)
        console.log('sb', typeof diary.content)
        this.setData({ diary });
        console.log(this.data.diary,'sb');
        const imageUrls = diary.images.map((img) => ({type:0,url:img.url}));
        this.data.previewImgUrls = diary.images.map((img) => img.url);
        if(diary.video === undefined){
            this.setData({ swiperList:[...imageUrls] });
        }else{
            this.setData({ swiperList:[{type:1, url:diary.video},...imageUrls] });
        }
        
        console.log('swipperList:',this.data.swiperList)
    },
    // 生命周期
    onLoad: function (options) {
        wx.showShareMenu(); // 启用分享功能
        // TODO: 根据传入的 diaryId 获取游记详情
        const { diaryId } = options;
        this.getDiaryDetail(diaryId);
    },

    onShareAppMessage() {
        return {
            title: '这是分享的标题',
            path: '/pages/home/index', // 要分享的页面路径
            imageUrl: '/images/share.png', // 可选：自定义图片
          };
      },

});

// Page({

//   /**
//    * 页面的初始数据
//    */
//   data: {

//   },

//   /**
//    * 生命周期函数--监听页面加载
//    */
//   onLoad(options) {

//   },

//   /**
//    * 生命周期函数--监听页面初次渲染完成
//    */
//   onReady() {

//   },

//   /**
//    * 生命周期函数--监听页面显示
//    */
//   onShow() {

//   },

//   /**
//    * 生命周期函数--监听页面隐藏
//    */
//   onHide() {

//   },

//   /**
//    * 生命周期函数--监听页面卸载
//    */
//   onUnload() {

//   },

//   /**
//    * 页面相关事件处理函数--监听用户下拉动作
//    */
//   onPullDownRefresh() {

//   },

//   /**
//    * 页面上拉触底事件的处理函数
//    */
//   onReachBottom() {

//   },

//   /**
//    * 用户点击右上角分享
//    */
//   onShareAppMessage() {

//   }
// })
