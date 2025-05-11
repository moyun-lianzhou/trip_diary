// 获取图片的尺寸信息（小程序适配版）
export const getImageDimension = (fileUrl) => {
    return new Promise((resolve, reject) => {
        wx.getImageInfo({
            src: fileUrl,
            success: (res) => {
                resolve({
                    width: res.width,
                    height: res.height
                });
            },
            fail: (err) => {
                reject("获取图片信息失败");
            }
        });
    });
};