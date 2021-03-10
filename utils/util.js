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

function dateFormat(date, format) {
	if(date==""||date==null){
		return "";
	}
  if (typeof date === "string") {
      var mts = date.match(/(\/Date\((\d+)\)\/)/);
      if (mts && mts.length >= 3) {
          date = parseInt(mts[2]);
      }
      date = new Date(date.replace(/-/g, "/"));
  }
  
  if (!date || date.toUTCString() == "Invalid Date") {
      return "";
  }

  var map = {
      "M": date.getMonth() + 1, //月份 
      "d": date.getDate(), //日 
      "h": date.getHours(), //小时 
      "m": date.getMinutes(), //分 
      "s": date.getSeconds(), //秒 
      "q": Math.floor((date.getMonth() + 3) / 3), //季度 
      "S": date.getMilliseconds() //毫秒 
  };
  format = format.replace(/([yMdhmsqS])+/g, function(all, t){
      var v = map[t];
      if(v !== undefined){
          if(all.length > 1){
              v = '0' + v;
              v = v.substr(v.length-2);
          }
          return v;
      }
      else if(t === 'y'){
          return (date.getFullYear() + '').substr(4 - all.length);
      }
      return all;
  });
  return format;
};



/**
 * 微信登录
 */
function login() {
  return new Promise(function (resolve, reject) {
    return getCode().then(function(res){  
      return request(api.Login,{code:res},"GET").then(res=>{        
        console.log(res)
        wx.setStorageSync('token', res.data.token);
        wx.setStorageSync('uid', res.data.id);
        wx.setStorageSync('ifAuth', true);        
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
          reject({code:-1,msg:"您的网络好像不好,刷新试试?"});
        }
      },
      fail: function (err) {
        reject({code:-1,msg:"您的网络好像不好,刷新试试?"});
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
                wx.setStorageSync('userInfo', res.userInfo);
                resolve(res);
              } else {
                reject({code:-1,msg:"获取用户信息失败,请稍后再试"});
              }
            },
            fail: function (err) {
              console.log(err);
              reject({code:-1,msg:"获取用户信息失败,请稍后再试"});
            }
          })
        }else{
          reject({code:-1,msg:"用户未进行授权,无法获取权限"});
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
    return getCode().then((res) => {      
      return getUserInfo().then(userInfo=>{
        return request(api.Auth,JSON.stringify({
          code: res,
          encryptedData: userInfo.encryptedData,
          iv: userInfo.iv,
          signature: userInfo.signature,
          rawData: userInfo.rawData
        }),"POST").then(res=>{
          console.log(res)
          wx.setStorageSync('token', res.data.token);
          wx.setStorageSync('uid', res.data.id);
          wx.setStorageSync('ifAuth', true);
          resolve(res);        
        }).catch((err) => {
          reject(err);
        })
      }).catch(err=>{
        reject(err);
      });
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
        //服务器返回的数据
        let returndata = res.data;          
        if (returndata.code == 401) {
          console.log("重新获取token 然后在进行")
          //需要登录后才可以操作
          retry++
          if(retry<3){
            console.log("come retry")
            return auth().then((result) => {               
              return request(url,data,method).then(function(res){
                console.log(res);
                resolve(res);
              }).catch(err=>{
                console.log(5);
                console.log(err);      
                reject(err);                            
              });             
            }).catch(function(err){
              console.log(4);
              reject({code:-1,msg:'授权失败,请重新授权'});
            });
          }else{              
            reject({code:-2,msg:"糟糕!好像出现问题了!刷新一下试试?"});
          }
        } else {
          console.log("come success")
          if(returndata.code==0){
            resolve(returndata);
          }else{
            reject(returndata);
          }            
        }
      },
      fail: function (err) {               
        console.log(err)
        reject({code:-2,msg:"糟糕!好像出现问题了!刷新一下试试?"})
      },
      complete(){
        wx.hideLoading(); 
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
//数组分组
function ItemGroupBy(arr, key) {
  let newArr = [],
      types = {},
      newItem, i, j, cur;
  for (i = 0, j = arr.length; i < j; i++) {
      cur = arr[i];
      if (!(cur[key] in types)) {
          types[cur[key]] = { type: cur[key], data: [] };
          newArr.push(types[cur[key]]);
      }
      types[cur[key]].data.push(cur);
  }
  return newArr;
};
const groupBy = (list, fn) => {
  const groups = {};
  list.forEach(function (o) {
      const group = fn(o);
      groups[group] = groups[group] || [];
      groups[group].push(o);
  });
  // return Object.keys(groups).map(function (group) {
  //     return groups[group];
  // });
  return groups;
}
module.exports = {
  dateFormat,
  formatTime,
  warn,
  prompt,
  auth,
  getCode,
  getUserInfo,
  request,
  login,
  groupBy
}
