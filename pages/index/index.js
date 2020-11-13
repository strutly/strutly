const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../config/api.js');
var that;
Page({
  data: {
    index:0,
    endline:false,
    datas:[]
  },  
  onLoad: function (options) {
    that = this;
    wx.getSystemInfo({ 
      success: function (res) {
        console.log(res);
        let modelmes = res.model;
        if (modelmes.search('iPhone X') != -1) {
          that.setData({
            options:options,    
            isIphoneX: true
          })
        }
      }    
    })
    that.listRecord(0);　 
  },
  listRecord(pageNo){
    let datas = that.data.datas;
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
    let ifAuth = wx.getStorageSync('ifAuth')||false;
    if(ifAuth){
      wx.navigateTo({
        url: '/pages/index/form',
      })
    }else{
      that.setData({
        auth:true,
        callBack:function(){
          that.push()
        }
      })
    }    
  },
  cancle(){
    that.setData({
      auth:false
    })
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
  switchTabbar: app.switchTabbar,
  toUrl:app.toUrl,
  refresh(){
    that.setData({
      prompt:false
    });
    that.onLoad(that.data.options)
  },
  onReachBottom(){
    let endline = that.data.endline;
    if(!endline){
      let pageNo = that.data.pageNo + 1;
      that.listRecord(pageNo);
    }    
  }
})
