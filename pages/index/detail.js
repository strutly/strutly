const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../config/api.js');
var that;
Page({
  data:{
    like:false,
    comment:false,
  },
  onLoad(options){
    that = this;
    let id = options.id;
    util.request(api.Record+"/"+id,{},"GET").then(res=>{
      that.setData({
        detail:res.data,
        id:id
      })
      util.request(api.Comment+"/"+that.data.id,{},"GET").then(res=>{
        that.setData({
          like:res.data
        })
        
      })
    })
  },
  comment(e){
    let ifAuth = wx.getStorageSync('ifAuth');
    if(ifAuth){
      that.setData({
        comment:true,
        otherName:e.target.dataset.othername||"",
        oid:e.target.dataset.oid||""
      })
    }else{
      that.setData({
        auth:true,
        callBack:function(){
          that.comment(e)
        }
      })      
    }    
  },
  auth(e){
    console.log(3);
    wx.showLoading({
      mask:true,
      title: '授权中~~',
    })
    if (e.detail.errMsg !== 'getUserInfo:ok') {

      wx.hideLoading();
      if (e.detail.errMsg === 'getUserInfo:fail auth deny') {
        util.warn(that,"授权失败");
        return false;
      }
      return false;
    };
    util.getCode().then(function(res){
      wx.hideLoading();
      util.request(api.Auth,JSON.stringify({
        code: res,
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
        signature: e.detail.signature,
        rawData: e.detail.rawData
      }),"post").then(function(result){
        wx.setStorageSync('ifAuth', true);
        that.setData({
          auth:false
        })
        that.data.callBack(); 
      });
    })       
  },
  giveup(e){
    that.setData({
      comment:false,
      content:e.detail.value
    })
  },
  cancle(){
    that.setData({
      auth:false
    })
  },
  submit(e){
    console.log(e)
    if(e.detail.value){
      that.setData({
        content:e.detail.value
      })
      that.handle(2);
    }else{
      that.setData({
        comment:true
      })
      util.warn(that,"回复内容不能为空!");
    }
  },
  like(){
    let ifAuth = wx.getStorageSync('ifAuth');
    if(ifAuth){
      that.handle(1);
    }else{
      that.setData({
        auth:true,
        callBack:function(){
          that.like()
        }
      })      
    } 
  },
  onShareAppMessage(e){
    console.log(e);
  },
  
  handle(type){
    let data = {
      rid:that.data.id,
      msg:that.data.detail.msg,
      pic:that.data.detail.imgs[0],
      oid:that.data.oid||null,
      otherName:that.data.otherName||"",
      content:that.data.content||"",
      type:type
    };
    console.log(data);
    util.request(api.Comment,JSON.stringify(data),"POST").then(res=>{
      that.onLoad({id:that.data.id})
    });
  }
})