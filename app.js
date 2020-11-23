//app.js

const util = require('./utils/util.js');
const api = require('./config/api')
require('./common')
App({
  globalData:{
    num:0
  },
  onLaunch: function () {
    var that = this;
    // 获取用户信息
    wx.getSetting({
      success: res => {
        console.log(res);
        if (res.authSetting['scope.userInfo']) {
          util.login().then(function(result){            
            console.log(result);
            console.log(222);
            if(result.code===0){
              wx.setStorageSync('token', result.data.token);
              wx.setStorageSync('uid', result.data.id);
              wx.setStorageSync('ifAuth', true);
              
            }else{
              wx.setStorageSync('ifAuth', false);
            }
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                // 可以将 res 发送给后台解码出 unionId
                wx.setStorageSync('userInfo', res.userInfo);
                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                that.globalData.userInfo = res.userInfo;
                // 所以此处加入 callback 以防止这种情况
                if (that.userInfoReadyCallback) {
                  that.userInfoReadyCallback(res)
                }
              }
            })
          }).catch(function(res){
            console.log(res)
            console.log(32)
            wx.setStorageSync('ifAuth', false);
          })          
        }else{
          wx.setStorageSync('ifAuth', false);
        }
      }
    })
  },
  
    
})