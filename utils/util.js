const api = require('../config/api.js');
const log = require('../utils/log.js')
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
};
/**
 * 微信登录
 */
function login() {
  return new Promise(function (resolve, reject) {
    return getCode().then(function(res){
      return request(api.Login,{code:res},"GET").then(res=>{
        resolve(res);
      }).catch(err=>{
        reject(err);
      })
    }).catch((err) => {
      console.log(err);
      reject(err);
    });
  })
};

/**
 * wx.login
 * 获取code
 */
function getCode() {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        if (res.code) {
          resolve(res.code);
        } else {
          reject(res);
        }
      },
      fail: function (err) {
        reject(err);
      }
    });
  });
};
/**
 * 获取用户信息
 */
function getUserInfo() {
  return new Promise(function (resolve, reject) {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            withCredentials: true,
            success: function (res) {
              console.log(res);
              if (res.errMsg === 'getUserInfo:ok') {
                resolve(res);
                wx.setStorageSync('userInfo', res.userInfo);
              } else {
                reject(res)
              }
            },
            fail: function (err) {
              console.log(err);
              reject(err);
            }
          })
        }else{
          reject({errcode:-1,errMsg:"用户未进行授权,无法获取权限"});
        }
      }
    })    
  });
};
/**
 * 授权
 */
function auth(){
  return new Promise(function (resolve, reject) {
    let code  = null;
    return getCode().then((res) => {
      code = res;
      return getUserInfo();
    }).then((userInfo) => {
      return request(api.Auth,JSON.stringify({
        code: code,
        encryptedData: userInfo.encryptedData,
        iv: userInfo.iv,
        signature: userInfo.signature,
        rawData: userInfo.rawData
      }),"POST").then(res=>{
        resolve(res);
      }).catch((err) => {
        console.log(err);
        reject(err);
      })
    }).catch((err) => {
      console.log(err);
      reject(err);
    });
  })
};
var retry = 0;
function request(url, data = {}, method = "GET") {
  console.log({url:url,data:data});
  log.info(data);
  wx.showLoading({
    title: '请稍后',
    mask:true
  });
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'token':wx.getStorageSync('token')||""
      },
      dataType:"json",
      success: function (res) {
        log.info(res);
        console.log(res);
        wx.hideLoading();
        if (res.statusCode == 200) {
          /**/
          console.log()
          if (res.data.code == 401) {
            console.log("重新获取token 然后在进行")
            //需要登录后才可以操作

            retry++
            if(retry<3){
              return auth().then((result) => {
                
                wx.setStorageSync('token', result.data.token);
                wx.setStorageSync('uid', result.data.id);
                wx.setStorageSync('ifAuth', true);
                request(url,data,method).then(function(res){
                  resolve(res);
                }).catch(err=>{
                  console.log(5);
                  reject(err);
                });             
              }).catch(function(err){
                console.log(4);
                reject(err);
              });
            }else{
              reject(res);
            }
          } else {
            resolve(res.data);
          }
        } else {
          reject(res);
        }
      },
      fail: function (err) {
        wx.hideLoading();        
        console.log(err)
        reject({msg:"糟糕!好像出现问题了!刷新一下试试?"})
      }
    })
  });
};

function prompt(that,msg){
  that.setData({
    prompt:true,
    promptMsg:msg
  })
};
//提示
function warn(that, warnMsg) {
  that.setData({
    warn: true,
    warnMsg: warnMsg
  });
  setTimeout(function () {
    that.setData({
      warn: false,
      warnMsg: ''
    })
  }, 1500);
};
module.exports = {
  formatTime,
  warn,
  prompt,
  auth,
  getCode,
  request,
  login
}
