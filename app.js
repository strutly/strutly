//app.js

const util = require('./utils/util.js');
const api = require('./config/api')
require('./common')
App({
  globalData:{
    num:0,
    indexRefresh:true,
    url:'/pages/index/index'
  },
  onLaunch: function () {
    var that = this;
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    console.log(menuButtonObject)
    //获取设备信息
    wx.getSystemInfo({ 
      success: function (res) {
        console.log(res);

        let statusBarHeight = res.statusBarHeight,
          navTop = menuButtonObject.top,//胶囊按钮与顶部的距离
          navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight)*2;//导航高度
        that.globalData.navHeight = navHeight;
        that.globalData.navTop = navTop;
        that.globalData.windowHeight = res.windowHeight;


        let modelmes = res.model;
        if (modelmes.search('iPhone X') != -1) {
          wx.setStorageSync('isIphoneX', true);
        }else{
          wx.setStorageSync('isIphoneX', false);
        }
      }    
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        console.log(res);
        if (res.authSetting['scope.userInfo']) {
          util.login().then(function(result){           
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
            wx.setStorageSync('ifAuth', false);
          })          
        }else{
          wx.setStorageSync('ifAuth', false);
        }
      }
    })
    
  },
  
    
})