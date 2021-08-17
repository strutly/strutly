// pages/index/play.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:'http://pic.strutly.cn/mylove/e649640d-5c37-4a86-9597-a8a0128345ac.mp4',
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  screenChange(e){
    console.log('视频错误信息:')
    console.log(e.detail.errMsg)
  }
})