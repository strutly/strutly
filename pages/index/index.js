const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../config/api.js');
var that;
Page({
  data: {
    index:0,
    endline:false,
    datas:[],
    num:app.globalData.num,
    black:[],
    uid:wx.getStorageSync('uid'),
    confirmMsg:"确认将Ta关进小黑屋7天吗?"
  },  
  async onLoad(options) {
    that = this;
    that.setData({
      options:options,
      datas:[],
      endline:false
    })
    await api.login();

    console.log("login end");
    that.listRecord(1);
  },
  onShow: function () {
    console.log("onshow")
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      that.getTabBar().setData({
        selected: 0
      })
    }
  },
  userHome(e){
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
          url: '/pages/index/my',
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
  black(datas){
    let black = that.data.black;
    
    datas = datas.filter(item => black.indexOf(item.miniUser.id)<0)
    that.setData({
      datas:datas
    })
  },
  async listRecord(pageNo){
    let datas = that.data.datas;
    let res = await api.record({pageNo:pageNo});
    that.setData({
      pageNo:pageNo,
      endline: res.data.last,
      datas:datas.concat(res.data.content)
    });
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
  async auth(e){
    let res = {};
    try {
      res = await wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      })
    } catch (error) {
      return util.warn(that,"授权失败,请重试~");
    }
    let code = await api.getCode();
    console.log(res)
    if(res.errMsg=="getUserProfile:ok"){
      let userInfo = res.userInfo
      wx.setStorageSync('userInfo', userInfo);      
      let authRes = await api.authorize({
        code:code,
        encryptedData:res.encryptedData,
        iv:res.iv,
        signature:res.signature,
        rawData:res.rawData
      });
      wx.setStorageSync('token', authRes.data);
      wx.setStorageSync('uid', authRes.data.id);
      wx.setStorageSync('ifAuth', true);
      if(authRes.code==0){
        that.setData({
          auth:false
        })
        that.data.callBack();
      }else{
        util.warn(that,authRes.msg);
      }
    }else{
      util.warn(that,"授权失败,请重试~");
    }       
  },  
  refresh(){
    that.setData({
      prompt:false
    });
    that.onLoad(that.data.options)
  },
  onPullDownRefresh:function(){
    wx.showNavigationBarLoading() //在标题栏中显示加载
    setTimeout(function(){
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
      that.setData({
        datas:[],
        endline:false
      });
      that.listRecord(1);
    },1500);
  },
  onReachBottom(){
    let endline = that.data.endline;
    if(!endline){
      let pageNo = that.data.pageNo + 1;
      that.listRecord(pageNo);
    }    
  },
  confirm(e){
    console.log(e);
    let ifAuth = wx.getStorageSync('ifAuth')||false;
    let black = that.data.black;
    if(ifAuth){
      that.setData({
        confirm:true
      })
      that.yes = async ()=>{
        let uid = e.currentTarget.dataset.uid;
        let res = await api.black();
        console.log(res);
        black.push(uid);
        that.setData({
          confirm:false,
          black:black
        });            
      }
      that.no =()=>{
        that.setData({
          confirm:false
        })
      }
    }else{
      that.setData({
        auth:true,
        callBack:function(){
          that.confirm(e)
        }
      })
    }
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
      path: '/pages/index/index'
    }
  }
})
