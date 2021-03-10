const util = require("../../utils/util");
const api = require("../../config/api");
const app = getApp();
var that;
Page({
  data:{
    navHeight:app.globalData.navHeight,
    navTop:app.globalData.navTop,
    delete:false,
    pageName:'发表日志',
    isIphoneX:wx.getStorageSync('isIphoneX')
  },
  onLoad(options){
    that = this;
    let formData = wx.getStorageSync('formData')||{open:1,imgs:[]};
    console.log(formData)
    that.setData({
      formData:formData,
      options:options
    })
  },
  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1,
      })
    }
  },
  open(){
    let open = that.data.formData.open;
    that.setData({
      ['formData.open']:1^open,
    })
  },
  handleLongPress(){    
    let de = that.data.delete;
    that.setData({
      delete:!de
    })    
  },
  remove(e){
    console.log(e)
    let index = e.currentTarget.dataset.index;
    console.log(index)
    let imgs = that.data.formData.imgs;
    imgs.splice(index,1);
    console.log(imgs)
    that.setData({
      ['formData.imgs']:imgs
    })
    wx.setStorageSync('formData', that.data.formData);
  },
  previewImage(e) {
    var current = e.currentTarget.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: that.data.formData.imgs // 需要预览的图片http链接列表  
    })
  },
  addImg(){
    that.setData({
      delete:false
    })
    let imgs = that.data.formData.imgs;  
    // 微信 API 选择图片（从相册）
    wx.chooseImage({
      count: 9 - imgs.length,
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths);
        for (var i = 0; i < res.tempFilePaths.length; i++) {
          wx.getFileSystemManager().readFile({
            filePath: tempFilePaths[i], //选择图片返回的相对路径
            encoding: "base64",//这个是很重要的
            success: res => { //成功的回调
              util.request(api.QiniuBase64,res.data,"post").then(result=>{
                console.log(result);
                if(result.code==-1){
                  util.warn(that,result.msg);
                }else{
                  imgs.push(result.data.src);
                  that.setData({
                    ['formData.imgs']:imgs
                  })
                  wx.setStorageSync('formData', that.data.formData);  
                }
              })              
            }
          })
        }              
      }
    })
  },
  form(){
    let formData = that.data.formData
    if(formData.msg==""){
      return util.warn(that,"请输入内容后再提交");
    }
    if(formData.imgs.length<1){
      return util.warn(that,"请至少添加一张图片");
    }
    util.request(api.Record,JSON.stringify(formData),"POST").then(function(res){
      if(res.code==0){
        wx.removeStorageSync('formData');
        wx.reLaunch({
          url: '/pages/index/index',
        })
      }else{
        util.warn(that,res.errMsg);
      }
    })
  },
  bindTextAreaBlur(e){
    console.log(e);
    that.setData({
      ['formData.msg']:e.detail.value
    })
    wx.setStorageSync('formData', that.data.formData);
  },
  cancle(){
    that.setData({
      auth:false
    })
  },
  handlerGohomeClick(){
    let url = app.globalData.url
    console.log(url)
    wx.switchTab({
      url
    })
  }
});