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
      urls: [current] // 需要预览的图片http链接列表  
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
        console.log(res);
        for (var i = 0; i < res.tempFilePaths.length; i++) {
          that.upload(tempFilePaths[i],0,tempFilePaths[i]);          
        }              
      }
    })
  },
  addVideo(){
    wx.chooseMedia({
      mediaType:['video'],
      sourceType: ['album', 'camera'], // album 从相册选视频，camera 使用相机拍摄
      maxDuration: 60, // 拍摄视频最长拍摄时间，单位秒。最长支持60秒
      camera: 'back',//默认拉起的是前置或者后置摄像头，默认back
      compressed: true,//是否压缩所选择的视频文件
      success: function(res){
        console.log(res)
        let tempFile = res.tempFiles[0];//选择定视频的临时文件路径（本地路径）
        let duration = tempFile.duration //选定视频的时间长度
        let size = parseFloat(tempFile.size/1024/1024).toFixed(1) //选定视频的数据量大小
        that.data.duration = duration
        if(parseFloat(size) > 100){
          that.setData({
            clickFlag: true,
            duration: ''
          })
          let beyondSize = parseFloat(size) - 100
          wx.showToast({
            title: '上传的视频大小超限，超出'+beyondSize+'MB,请重新上传',
            //image: '',//自定义图标的本地路径，image的优先级高于icon
            icon:'none'
          })
        }else{
          console.log(tempFile)
          //2.本地视频资源上传到服务器
          that.upload(tempFile.tempFilePath,1,tempFile.thumbTempFilePath);
        }
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
  },
  onReady() {
    this.videoContext = wx.createVideoContext('myVideo')
  },
  videoErrorCallback(e) {
    console.log('视频错误信息:')
    console.log(e.detail.errMsg)
  },
  upload(tempFilePath,type,cover){
    console.log(tempFilePath)
    let imgs = that.data.formData.imgs;  
    wx.uploadFile({
      url: api.QiniuFile, 
      filePath: tempFilePath,
      name: 'file',
      success (res){
        console.log(res)
        let data = JSON.parse(res.data);
        let item = {type:type,url:data.data.src,cover:data.data.src};
        if(type=2){
          item.cover = cover;  
        }
        imgs.push(item);
        that.setData({
          ['formData.imgs']:imgs
        })
        wx.setStorageSync('formData', that.data.formData);        
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