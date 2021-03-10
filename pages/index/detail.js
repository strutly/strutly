const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../config/api.js');
var that;
Page({
  data:{
    like:0,
    comment:false,
    uid:wx.getStorageSync('uid')||"",
    confirmMsg:"确认删除这条评论吗?"
  },
  onLoad(options){
    console.log(options)
    that = this;
    let id = options.id;
    that.setData({
      options:options,
      id:id
    })
  },
  onShow(){
    let id = that.data.id;
    util.request(api.Record+"/"+id,{},"GET").then(res=>{
      if(res.data!=null){
        that.setData({
          detail:res.data,
          likes:res.data.counts[1]||[],
          replys:res.data.counts[2]||[],
          id:id
        })
      }else{
        that.setData({
          noData:true,
          noDataTo:"/pages/index/index",
          noDataMsg:"该内容不存在或已经隐藏,去主页看看吧!",
          noDataBtn:"主页"
        })
      }      
    })
  },
  onReady(){
    let ifAuth = wx.getStorageSync('ifAuth')||false;
    if(ifAuth){
      util.request(api.Comment+"/"+that.data.id,{},"GET").then(res=>{
        console.log(res)
        console.log(res.data)
        that.setData({
          like:res.data?1:0
        })        
      })
    }    
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
  onShareAppMessage: function (res) {
    return {
      title: 'Baby-Record',
      path: '/pages/index/index'
    }
  },
  onShareTimeline:function(res){
    return {
      title: 'Baby-Record',
      path: '/pages/index/detail?id='+that.data.id
    }
  },
  previewImage: function (e) {
    console.log(e)
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: that.data.detail.imgs // 需要预览的图片http链接列表  
    })
  },
  home(e){
    let ifAuth = wx.getStorageSync('ifAuth')||false;
    if(ifAuth){
      let uid = e.currentTarget.dataset.uid;
      let id = wx.getStorageSync('uid');
      if(uid != id){
        wx.navigateTo({
          url: "/pages/index/you?uid="+uid,
        })
      }else{
        wx.switchTab({
          url:"/pages/index/my"
        })
      }
      
    }else{
      that.setData({
        auth:true,
        callBack:function(){
          that.home(e)
        }
      })
    }    
  },
  handle(type){
    let userInfo = wx.getStorageSync('userInfo');
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
      console.log(res)
      if(type==1){
        let like = that.data.like;
        like = -1*like + 1;
        let likes = that.data.likes;
        if(like==1){
          likes.push({uid:that.data.uid,nickName:userInfo.nickName})
        }else{
          let index =  likes.findIndex(item => item.uid === that.data.uid);
          console.log(index);
          likes.splice(index,1);
          console.log(likes)
        }
        that.setData({
          like:like,
          likes:likes
        })
      }else{
        console.log(res)
        let replys = that.data.replys;
        data.id = res.data;
        data.uid = that.data.uid;
        data.nickName = userInfo.nickName;
        data.avatarUrl = userInfo.avatarUrl;
        data.createTime = util.dateFormat(new Date(),'yyyy-MM-dd hh:mm:ss');
        replys.push(data)
        that.setData({
          replys:replys
        })
      }
    });
  },
  confirm(e){
    console.log(e);
    let index = e.currentTarget.dataset.index;
    that.setData({
      confirm:true
    })
    that.yes =()=>{
      util.request(api.Comment+"/"+e.currentTarget.dataset.id,{},"DELETE").then(res=>{
        let replys = that.data.replys;
        replys.splice(index,1);
        that.setData({
          confirm:false,
          replys:replys
        })
      })      
    }
    that.no =()=>{
      that.setData({
        confirm:false
      })
    }
  }
})