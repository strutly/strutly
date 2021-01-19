//index.js

const util = require("../../utils/util");
const api = require("../../config/api");
//获取应用实例
const app = getApp()
var that;
Page({
  data: {
    index:1,
    user:wx.getStorageSync('userInfo'),
    num:app.globalData.num,
    myRecords:[],
    isIphoneX:wx.getStorageSync('isIphoneX')
  },  
  onLoad: function (options) {
    that = this;
    that.setData({    
      options:options||{}
    })
   let uid = options.id||wx.getStorageSync('uid');
   console.log(uid);
   util.request(api.MyInfo + "/" + uid,{},"GET").then(res=>{
    that.setData({
      userInfo:res.data
    })
    that.recordList(0);
   }).catch(err=>{
    that.setData({
      prompt:true,
      promptMsg:err.msg
    })
  })  
  },
  recordList(pageNo){
    let datas = that.data.datas||[];
    let id = wx.getStorageSync('uid');
    util.request(api.Record+"/my",{pageNo:pageNo,uid:id},"GET").then((res) => {
      console.log(pageNo);
      console.log(res)
      if((pageNo==0)&&(res.data==null || res.data.length==0)){
        that.setData({
          noData:true
        })
      }else if((pageNo!=0)&&(res.data==null || res.data.length==0)){
          that.setData({
            endline:true
          })
      }else{
        datas = datas.concat(res.data);
        let arr = util.groupBy(datas,(data)=>{
          return util.dateFormat(data.createTime,'yyyy年MM月')
        })
        that.setData({
          pageNo:pageNo,
          datas:datas,
          myRecords:arr
        })
      }
    }).catch(err=>{
      that.setData({
        prompt:true,
        promptMsg:err.msg
      })
    })
  },
  confirm(e){
    let type = e.currentTarget.dataset.type;
    that.setData({
      [type]:true
    })
  },
  handle(e){
    let type = e.currentTarget.dataset.type;
    let id = e.currentTarget.dataset.id;
    let datas = that.data.datas;
    console.log(datas)
    let index = datas.findIndex((value, index, arr) => {
      return value.id == id;
    })
    console.log(index)
    util.request(api.Record+"/"+id,{},type).then(res=>{
      util.warn(that,"操作成功!");
      that.setData({
        move:false
      })
      console.log(type=="delete")
      if(type=="delete"){
        console.log("delete")
        datas.splice(index,1);
        
      }else{
        datas[index].open = !datas[index].open;
      }
      console.log(datas);
      let arr = util.groupBy(datas,(data)=>{
        return util.dateFormat(data.createTime,'yyyy年MM月')
      })
      that.setData({
        myRecords:arr
      })
      console.log(res)
    }).catch(err=>{
      util.warn(that,"操作失败!请稍后再试!")
    })
  },
  touchstart(e){
    that.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,      
      move: false,
      delete:false,
      put:false
    })
  },
  //滑动事件处理
  touchmove: function (e) {
    
    var index = e.currentTarget.dataset.index,//当前索引
    startX = that.data.startX,//开始X坐标    
    startY = that.data.startY,//开始Y坐标    
    touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标    
    touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标    
    //获取滑动角度    
    angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    if (Math.abs(angle) > 30) return;
    if(touchMoveX < startX){
      that.setData({
        move:true,
        moveIndex:index
      })
    }  
  },
  angle: function (start, end) {
    var _X = end.X - start.X,    
    _Y = end.Y - start.Y    
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);    
  },
  push(){
    wx.navigateTo({
      url: '/pages/index/form',
    })
  },
  onReachBottom(){
    let endline = that.data.endline;
    if(!endline){
      let pageNo = that.data.pageNo + 1;
      that.recordList(pageNo);
    }    
  }
});

