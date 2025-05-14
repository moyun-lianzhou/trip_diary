import request from "~/api/request";

Component({
  options: {
    styleIsolation: 'shared',
  },
  properties: {
    navType: {
      type: String,
      value: 'title',
    },
    titleText: String,
    searchShow: Boolean,
  },
  data: {
    value: '',
    actionText: '',
    keyWord:'',
    visible: false,
    sidebar: [
      {
        title: '首页',
        url: 'pages/home/index',
        isSidebar: true,
      },
      {
        title: '搜索页',
        url: 'pages/search/index',
        isSidebar: false,
      },
      {
        title: '发布页',
        url: 'pages/release/index',
        isSidebar: false,
      },
      {
        title: '消息列表页',
        url: 'pages/message/index',
        isSidebar: true,
      },
      {
        title: '对话页',
        url: 'pages/chat/index',
        isSidebar: false,
      },
      {
        title: '个人中心页',
        url: 'pages/my/index',
        isSidebar: true,
      },
      {
        title: '个人信息表单页',
        url: 'pages/my/info-edit/index',
        isSidebar: false,
      },
      {
        title: '设置页',
        url: 'pages/setting/index',
        isSidebar: false,
      },
      {
        title: '数据图表页',
        url: 'pages/dataCenter/index',
        isSidebar: false,
      },
      {
        title: '登录注册页',
        url: 'pages/login/login',
        isSidebar: false,
      },
    ],
    statusHeight: 0,
  },
  lifetimes: {
    ready() {
      const statusHeight = wx.getWindowInfo().statusBarHeight;
      this.setData({ statusHeight });
    },
  },
  methods: {
    openDrawer() {
      this.setData({
        visible: true,
      });
    },
    itemClick(e) {
      const that = this;
      const { isSidebar, url } = e.detail.item;
      if (isSidebar) {
        wx.switchTab({
          url: `/${url}`,
        }).then(() => {
          // 防止点回tab时，sidebar依旧是展开模式
          that.setData({
            visible: false,
          });
        });
      } else {
        wx.navigateTo({
          url: `/${url}`,
        }).then(() => {
          that.setData({
            visible: false,
          });
        });
      }
    },

    searchTurn() {
        console.log('聚焦')
      },
      onChangeValue(e){
        this.setData({searchWord:e.detail.value})
        console.log(this.data.searchWord)
    },



    changeHandle(e) {
        const { value } = e.detail;
        this.setData({keyWord:value});
      },
  
      focusHandle() {
        console.log('sb2')
        this.setData({
          actionText: '取消',
        });
      },
  
      blurHandle() {
        console.log('sb1')
        this.setData({
          actionText: '',
        });
      },
  
      actionHandle() {
        this.setData({
          value: '',
          actionText: '',
        });
      },
      async handleSubmit(){
          console.log('提交', this.data.keyWord)
          const keyWord = this.data.keyWord
          const {diaries, total} = await request('/diary/search', 'GET',{keyWord})
          if(!total){
              wx.showToast({
                title: '无相关游记',
                icon:'error'
              })
          }
          // 触发自定义事件传递数据
          this.triggerEvent('searchComplete', { diaries })
          console.log('传递的数据：',diaries)
      }
  },
});
