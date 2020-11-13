const util = require("../../utils/util");
const api = require("../../config/api");
const qiniuUploader = require("../../utils/qiniuUploader");

// 初始化七牛云相关配置
function initQiniu() {
  console.log(api.QINIU)
  var options = {
      // bucket所在区域，这里是华北区。ECN, SCN, NCN, NA, ASG，分别对应七牛云的：华东，华南，华北，北美，新加坡 5 个区域
      region: 'SCN',

      // 获取uptoken方法三选一即可，执行优先级为：uptoken > uptokenURL > uptokenFunc。三选一，剩下两个置空。推荐使用uptokenURL，详情请见 README.md
      // 由其他程序生成七牛云uptoken，然后直接写入uptoken
      uptoken: '',
      // 从指定 url 通过 HTTP GET 获取 uptoken，返回的格式必须是 json 且包含 uptoken 字段，例如： {"uptoken": "0MLvWPnyy..."}
      uptokenURL: api.QINIU,
      // uptokenFunc 这个属性的值可以是一个用来生成uptoken的函数，详情请见 README.md
      uptokenFunc: function () { },

      // bucket 外链域名，下载资源时用到。如果设置，会在 success callback 的 res 参数加上可以直接使用的 fileURL 字段。否则需要自己拼接
      domain: 'http://pic.strutly.cn',
      // qiniuShouldUseQiniuFileName 如果是 true，则文件的 key 由 qiniu 服务器分配（全局去重）。如果是 false，则文件的 key 使用微信自动生成的 filename。出于初代sdk用户升级后兼容问题的考虑，默认是 false。
      // 微信自动生成的 filename较长，导致fileURL较长。推荐使用{qiniuShouldUseQiniuFileName: true} + "通过fileURL下载文件时，自定义下载名" 的组合方式。
      // 自定义上传key 需要两个条件：1. 此处shouldUseQiniuFileName值为false。 2. 通过修改qiniuUploader.upload方法传入的options参数，可以进行自定义key。（请不要直接在sdk中修改options参数，修改方法请见demo的index.js）
      // 通过fileURL下载文件时，自定义下载名，请参考：七牛云“对象存储 > 产品手册 > 下载资源 > 下载设置 > 自定义资源下载名”（https://developer.qiniu.com/kodo/manual/1659/download-setting）。本sdk在README.md的"常见问题"板块中，有"通过fileURL下载文件时，自定义下载名"使用样例。
      shouldUseQiniuFileName: false
  };
  // 将七牛云相关配置初始化进本sdk
  qiniuUploader.init(options);
}


const app = getApp();
var that;
Page({
  data:{
    open:0,
    msg:"",
    images:[],
    delete:false
  },
  onLoad(){
    that = this;
    wx.getSystemInfo({ 
      success: function (res) {
        console.log(res);
        let modelmes = res.model;
        if (modelmes.search('iPhone X') != -1) {
          that.setData({    
            isIphoneX: true
          })
        }
      }    
   })　
  },
  open(){
    let open = that.data.open;
    that.setData({
      open:1^open,
    })
  },
  handleLongPress(){    
    let de = that.data.delete;
    that.setData({
      delete:!de
    })    
  },
  remove(e){
    let index = e.target.dataset.index;
    let images = that.data.images;
    images.splice(index,1);
    console.log(images)
    that.setData({
      images:images
    })
  },
  previewImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: that.data.images // 需要预览的图片http链接列表  
    })
  },
  addImg(){
    didPressChooesImage(that);
  },
  form(){
    let data = {
      msg:that.data.msg,
      open:that.data.open,
      imgs:that.data.images
    };
    util.request(api.Record,JSON.stringify(data),"POST").then(function(res){
      wx.navigateTo({
        url: '/pages/index/index',
      })
    })
  },
  bindTextAreaBlur(e){
    console.log(e);
    that.setData({
      msg:e.detail.value
    })
  },
  cancle(){
    that.setData({
      auth:false
    })
  },
});
// 图片上传（从相册）方法
function didPressChooesImage(that) {

  let images = that.data.images;

  // 初始化七牛云配置
  initQiniu();
  // 置空messageFileObject，否则在第二次上传过程中，wxml界面会存留上次上传的信息
  
  // 微信 API 选择图片（从相册）
  wx.chooseImage({
      // 最多可以选择的图片张数。目前本sdk只支持单图上传，若选择多图，只会上传第一张图
      count: 1,
      success: function (res) {
          var filePath = res.tempFilePaths[0];
          // wx.chooseImage 目前微信官方尚未开放获取原图片名功能(2020.4.22)
          // 向七牛云上传
          qiniuUploader.upload(filePath, (res) => {
              that.setData({
                images: images.concat(res.fileURL)
              });
              console.log('提示: wx.chooseImage 目前微信官方尚未开放获取原图片名功能(2020.4.22)');
              console.log('file url is: ' + res.fileURL);
          }, (error) => {
              console.error('error: ' + JSON.stringify(error));
          },
          
          null,
          (progress) => {
              that.setData({
                  'imageProgress': progress
              });
              console.log('上传进度', progress.progress);
              console.log('已经上传的数据长度', progress.totalBytesSent);
              console.log('预期需要上传的数据总长度', progress.totalBytesExpectedToSend);
          }, cancelTask => that.setData({ cancelTask })
          );
      }
  })
}