
import request from "~/api/request";

Page({
    data: {
        searchMode: false,
        diaryList: [],
        leftColumnData: [],
        rightColumnData: [],
        isSearchMode: false,
        currentPage: 0,
        pageSize: 5,
        totalPages: 0,
        loading: false, //是否展示 “正在加载” 字样
        loaded: false //是否展示 “已加载全部” 字样
    },
    hasData(){
        return !this.data.loaded;
    },
    // 初始化方法
    async initInfo(isRefresh = false) {
        if (this.data.loading) return; // 防止重复加载
        this.setData({ loading: true });

        try {
            const {pages,currentPage, diaries}= await request("/diary/page", "GET", {
                currentPage: isRefresh ? 1 : this.data.currentPage + 1,
                limit: this.data.pageSize
            });

            const newList = isRefresh ? diaries : [...this.data.diaryList, ...diaries];

            this.setData({
                diaryList: newList,
                totalPages: pages,
                currentPage,
                loading: false
            });
            console.log(this.data.currentPage, this.data.totalPages)

            // 如果列表数据条数小于总条数，隐藏 “正在加载” 字样，显示 “已加载全部” 字样
            if (diaries.length < this.data.pageSize) {
                this.setData({loading: false,loaded: true,});
            }
            this.fetchData(); // 瀑布流
        } catch (err) {
            console.log(err);
        }
    },
    fetchData() {
        // 模拟数据获取
        const allData = this.data.diaryList; // 你的数据
        console.log(allData)
        
        // 分列逻辑
        const left = [];
        const right = [];
        let leftHeight = 0;
        let rightHeight = 0;
        
        allData.forEach(item => {
            const width = item.images[0].width
            const height = item.images[0].height
            // 根据图片高度决定放入哪一列
            if (leftHeight <= rightHeight) {
                left.push(item);
                leftHeight += 340/(width/height) + 16;
            } else {
                right.push(item);
                rightHeight += 340/(width/height) + 16;
            }
        });
        
        this.setData({
            leftColumnData: left,
            rightColumnData: right
        });
        console.log('left', this.data.leftColumnData)
        console.log('right', this.data.rightColumnData)
    },

    goDiaryDetail(event){
        const diaryId = event.currentTarget.dataset.id; // 获取游记ID
        wx.navigateTo({
            url: `/pages/diaryDetail/index?diaryId=${diaryId}`,
        });
    },
    goRelease() {
        wx.navigateTo({
            url: "/pages/release/index",
        });
    },
    // 新增处理搜索完成的方法
    handleSearchComplete(e) {
        const diaries = e.detail.diaries;
        this.data.searchMode = true
        console.log('收到的数据：', diaries)
        this.setData({
            diaryList: diaries,
            isSearchMode: true
        });
        console.log('页面数据：',this.data.diaryList)
        this.fetchData(); // 调用现有方法刷新视图
    },
     // 恢复原始数据的方法
    resetData() {
        this.initInfo();
        this.setData({ isSearchMode: false });
    },
    // 生命周期
    onLoad() {
        this.initInfo();
        wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效
    },
    // 下拉刷新处理
    onPullDownRefresh() {
        this.data.searchMode = false
        wx.showNavigationBarLoading();
        // 使用 setData 正确重置状态
        this.setData({
            diaryList: [],
            leftColumnData: [],
            rightColumnData: [],
            currentPage: 0,
            totalPages: 0,
            loading: false,
            loaded: false,
            isSearchMode: false
        });
        // 重新拉取第一页数据
        this.initInfo(true).then(() => {
            wx.hideNavigationBarLoading();
            wx.stopPullDownRefresh(); // 结束下拉刷新动画
        });
    },
     // 上拉加载处理
     onReachBottom() {
         if(this.data.searchMode) return
        if(this.hasData()) {
            this.initInfo(false);
        }
    },

});
