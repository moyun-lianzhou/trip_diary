
import request from "~/api/request";

Page({
    data: {
        diaryList: [],
        leftColumnData: [],
        rightColumnData: [],
        isSearchMode: false,
        currentPage: 0,
        pageSize: 6,
        totalPages: 0,
        loading: false, //是否展示 “正在加载” 字样
        loaded: false //是否展示 “已加载全部” 字样
    },
    // 生命周期
    async onReady() {},
    hasData(){
        return this.data.totalPages < this.data.currentPage ? false : true
    },
    // 初始化方法
    async initInfo() {
        try {
            const {pages,currentPage, diaries}= await request("/diary/page", "GET", {
                currentPage: this.data.currentPage + 1,
                limit: this.data.pageSize
            });
            this.setData({
                diaryList: [...this.data.diaryList, ...diaries],
                totalPages: pages,
                currentPage,
                loading: false,
            });

            //如果列表数据条数小于总条数，隐藏 “正在加载” 字样，显示 “已加载全部” 字样
            if (diaries.length < this.data.pageSize) {
                this.setData({
                    loading: false,
                    loaded: true,
                });
            }
            
            this.fetchData(); // 瀑布流
        } catch (err) {
            console.log(err);
        }
    },
    // 新增上拉加载处理
    onReachBottom() {
        console.log('上拉加载')
        if(!this.hasData()){
            console.log('数据加载完毕')
            this.setData({
                loading: false, //加载中
                loaded: true //是否加载完所有数据
            });
            return
        }

        this.setData({
            loading: true, //加载中
            loaded: false //是否加载完所有数据
        });
        //延时调用接口
        setTimeout(()=> {
            this.initInfo();
        }, 500)
    },
    fetchData() {
        // 模拟数据获取
        const allData = this.data.diaryList; // 你的数据
        
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
    onLoad() {
        this.initInfo();
    },
    onRefresh() {
        
    },
    goRelease() {
        wx.navigateTo({
            url: "/pages/release/index",
        });
    },
    // 新增处理搜索完成的方法
    handleSearchComplete(e) {
        const diaries = e.detail.diaries;
        this.setData({
            diaryList: diaries,
            isSearchMode: true
        });
        this.fetchData(); // 调用现有方法刷新视图
    },
     // 恢复原始数据的方法
     resetData() {
        this.initInfo();
        this.setData({ isSearchMode: false });
    },
});
