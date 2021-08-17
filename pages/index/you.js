//index.js

const util = require("../../utils/util");
const api = require("../../config/api");
//获取应用实例
const app = getApp()
var that;
Page({
  data: {
    index:1,
    follow:1
  },  
  async onLoad(options) {
    console.log(options)
    that = this;
    that.setData({
      options:options||{}
    })

    let uid = options.uid;
    console.log(uid);
    let res = await api.userInfo({id:uid});
    that.setData({
      userInfo:res.data,
      options:options
    })
    that.recordList(1);      
  },
  async recordList(pageNo){
    let datas = that.data.datas||[];
    let id = that.data.options.uid;
    let res = await api.recordByUid({pageNo:pageNo,uid:id});
    datas = datas.concat(res.data.content);
    let arr = util.groupBy(datas,(data)=>{
      return util.dateFormat(data.createTime,'yyyy年MM月')
    })
    that.setData({
      pageNo:pageNo,
      endline: res.data.last,
      datas:datas,
      myRecords:arr
    })
  },  
  async follow(){
    let res = await api.addFans({oid:that.data.options.uid})
    
    if(res.code==0){
      let follow = 'userInfo.follow';
      let status = that.data.userInfo.follow;
      that.setData({
        [follow]:!status
      })
    }
      
  },

  onReachBottom(){
    let endline = that.data.endline;
    if(!endline){
      let pageNo = that.data.pageNo + 1;
      that.recordList(pageNo);
    }    
  }
})
