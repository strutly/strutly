//index.js

const util = require("../../utils/util");
const api = require("../../config/api");
//获取应用实例
const app = getApp()
var that;
Page({
  data: {
    index:1,
    follow:1
  },  
  onLoad: function (options) {
    that = this;
    wx.getSystemInfo({ 
      success: function (res) {
        console.log(res);
        let modelmes = res.model;
        if (modelmes.search('iPhone X') != -1) {
          that.setData({    
            isIphoneX: true,
            options:options||{}
          })
        }
      }    
   });
   let uid = options.id||wx.getStorageSync('uid');
   console.log(uid);
   util.request(api.MyInfo + "/" + uid,{},"GET").then(res=>{
    console.log(res)
   })
   
  },
  recordList(pageNo){
    let datas = that.data.datas;
    let id = that.data.options.id||wx.getStorageSync('uid');
    util.request(api.Record,{pageNo:pageNo},"GET").then((res) => {
      if((pageNo==0)&&(res.data==null || res.data.length==0)){
        that.setData({
          noData:true,
        })
      }else if((pageNo!=0)&&(res.data==null || res.data.length==0)){
          that.setData({
            endline:true
          })
      }else{      
        that.setData({
          pageNo:pageNo,
          datas:datas.concat(res.data)
        })
      }
    }).catch(err=>{
      that.setData({
        prompt:true,
        promptMsg:err.msg
      })
    })
  },
  push(){
    wx.navigateTo({
      url: '/pages/index/form',
    })
  },
  fans(){
    wx.navigateTo({
      url: '/pages/index/fans',
    })
  },
  follow(){
    let follow = that.data.follow;
    that.setData({
      follow:1^follow
    })
  },
  switchTabbar: app.switchTabbar,
  toUrl:app.toUrl,
})
