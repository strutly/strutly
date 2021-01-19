//index.js

const util = require("../../utils/util");
const api = require("../../config/api");
//获取应用实例
const app = getApp()
var that;
Page({
  data: {
    index:1,
    follow:1,
    isIphoneX:wx.getStorageSync('isIphoneX')
  },  
  onLoad: function (options) {
    console.log(options)
    that = this;
    that.setData({
      options:options||{}
    })

   let uid = options.uid;
   console.log(uid);
   util.request(api.MyInfo + "/" + uid,{},"GET").then(res=>{
    that.setData({
      userInfo:res.data,
      options:options
    })
    that.recordList(0)
   })   
  },
  recordList(pageNo){
    let datas = that.data.datas||[];
    let id = that.data.options.uid;
    util.request(api.Record+"/my",{pageNo:pageNo,uid:id},"GET").then((res) => {
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
  follow(){
    util.request(api.Fans,{oid:that.data.options.uid},"POST").then(res=>{
      if(res.code==0){
        let follow = 'userInfo.follow';
        let status = that.data.userInfo.follow;
        that.setData({
          [follow]:!status
        })
      }
      console.log(res)
    })
  },
  switchTabbar: app.switchTabbar,
  toUrl:app.toUrl,
  onReachBottom(){
    let endline = that.data.endline;
    if(!endline){
      let pageNo = that.data.pageNo + 1;
      that.recordList(pageNo);
    }    
  }
})
