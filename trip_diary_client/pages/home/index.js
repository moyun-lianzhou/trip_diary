// import Message from 'tdesign-miniprogram/message/index';
import request from "~/api/request";

Page({
    data: {
        enable: false,
        diaryList: [],
        motto: "Hello World",
        leftColumnData: [],
        rightColumnData: []
    },
    // 生命周期
    async onReady() {},
    async initInfo() {
        try {
            const { diaries } = await request("/diary", "GET");
            for (const item of diaries) {
                console.log(item);
                const { userInfo } = await request("/user/info", "GET", {
                    userId: item.authorId,
                });
                item.userInfo = userInfo;
            }
            this.setData({
                diaryList: diaries,
            });
        } catch (err) {
            console.log(err);
        }
        console.log(this.data.diaryList);

        this.fetchData()
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
    onLoad(option) {
        this.initInfo();
        // if (option.oper) {
        //   let content = '';
        //   if (option.oper === 'release') {
        //     content = '发布成功';
        //   } else if (option.oper === 'save') {
        //     content = '保存成功';
        //   }
        //   this.showOperMsg(content);
        // }
    },
    onRefresh() {
        // this.refresh();
    },
    async refresh() {},
    showOperMsg(content) {
        Message.success({
            context: this,
            offset: [120, 32],
            duration: 4000,
            content,
        });
    },
    goRelease() {
        wx.navigateTo({
            url: "/pages/release/index",
        });
    },
});
