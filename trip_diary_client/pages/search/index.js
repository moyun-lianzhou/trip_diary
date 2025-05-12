import request from '~/api/request';

Page({
  data: {
    historyWords: ['AI绘画', 'Stable Diffusion', '版权素材', '星空', 'illustration', '原创'],
    popularWords: [
        '考研和靠边同时上岸应该怎么选？有哪些参考建议',
        '日常饮食中，如何选择优质蛋白',
        '你有没有网购维权成功的经历？求分享经验',
        '夏季带孩子旅游，你的必备物品有哪些',
        '在海外越卖越贵，中国汽车做对了什么',
        '当HR问你离职原因，怎么回答最能被接受',
      ],
    searchValue: '',
    dialog: {
      title: '确认删除当前历史记录',
      showCancelButton: true,
      message: '',
    },
    dialogShow: false,
  },

  deleteType: 0,
  deleteIndex: '',

  onShow() {
    this.queryHistory();
    this.queryPopular();
  },

  /**
   * 查询历史记录
   * @returns {Promise<void>}
   */
  async queryHistory() {
    // request('/api/searchHistory').then((res) => {
    //   const { code, data } = res;

    //   if (code === 200) {
    //     const { historyWords = [] } = data;
    //     this.setData({
    //       historyWords,
    //     });
    //   }
    // });
  },

  /**
   * 查询热门搜索
   * @returns {Promise<void>}
   */
  async queryPopular() {
    // request('/api/searchPopular').then((res) => {
    //   const { code, data } = res;

    //   if (code === 200) {
    //     const { popularWords = [] } = data;
    //     this.setData({
    //       popularWords,
    //     });
    //   }
    // });
  },

  setHistoryWords(searchValue) {
    if (!searchValue) return;

    const { historyWords } = this.data;
    const index = historyWords.indexOf(searchValue);

    if (index !== -1) {
      historyWords.splice(index, 1);
    }
    historyWords.unshift(searchValue);

    this.setData({
      searchValue,
      historyWords,
    });
    // if (searchValue) {
    //     wx.navigateTo({
    //         url: `/pages/goods/result/index?searchValue=${searchValue}`,
    //     });
    // }
  },

  /**
   * 清空历史记录的再次确认框
   * 后期可能需要增加一个向后端请求的接口
   * @returns {Promise<void>}
   */
  confirm() {
    const { historyWords } = this.data;
    const { deleteType, deleteIndex } = this;

    if (deleteType === 0) {
      historyWords.splice(deleteIndex, 1);
      this.setData({
        historyWords,
        dialogShow: false,
      });
    } else {
      this.setData({ historyWords: [], dialogShow: false });
    }
  },

  /**
   * 取消清空历史记录
   * @returns {Promise<void>}
   */
  close() {
    this.setData({ dialogShow: false });
  },

  /**
   * 点击清空历史记录
   * @returns {Promise<void>}
   */
  handleClearHistory() {
    const { dialog } = this.data;
    this.deleteType = 1;
    this.setData({
      dialog: {
        ...dialog,
        message: '确认删除所有历史记录',
      },
      dialogShow: true,
    });
  },

  deleteCurr(e) {
    const { index } = e.currentTarget.dataset;
    const { dialog } = this.data;
    this.deleteIndex = index;
    this.deleteType = 0;
    this.setData({
      dialog: {
        ...dialog,
        message: '确认删除当前历史记录',
      },
      dialogShow: true,
    });
  },

  /**
   * 点击关键词跳转搜索
   * 后期需要增加跳转和后端请求接口
   * @returns {Promise<void>}
   */
  handleHistoryTap(e) {
    const { historyWords } = this.data;
    const { index } = e.currentTarget.dataset;
    const searchValue = historyWords[index || 0] || '';

    this.setHistoryWords(searchValue);
  },

  handlePopularTap(e) {
    const { popularWords } = this.data;
    const { index } = e.currentTarget.dataset;
    const searchValue = popularWords[index || 0] || '';

    this.setHistoryWords(searchValue);
  },

  /**
   * 提交搜索框内容
   * 后期需要增加跳转和后端请求接口
   * @returns {Promise<void>}
   */
  handleSubmit(e) {
    const { value } = e.detail;
    if (value.length === 0) return;

    this.setHistoryWords(value);
  },

  /**
   * 点击取消回到主页
   * @returns {Promise<void>}
   */
  actionHandle() {
    this.setData({
      searchValue: '',
    });
    wx.switchTab({ url: '/pages/home/index' });
  },
});
