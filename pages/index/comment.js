var that;
const app = getApp();
Page({
  data:{
    auth:false,
    like:0,
    detail:{
      id:4,
      nickName:"青梦蓝宇",
      createTime:"10月28日 21:08",
      content:"宝宝很漂亮的哦!",
      images:['https://gridpic.tsing-tec.com/3463142a-24b9-4f10-a214-3adf25e6980f.jpg','https://gridpic.tsing-tec.com/325054bc-0552-429a-a267-c65b961778ab.png','https://gridpic.tsing-tec.com/Fg3dOpl7L8VOjZutViKmR9WkM4Xa','https://gridpic.tsing-tec.com/Fg3Q63iBiCGeyFeSLfe420l2kzMr','https://gridpic.tsing-tec.com/Fg2tasndqknDqgD2RQkfAOyp4dFj','https://gridpic.tsing-tec.com/Fg2sPW4hpqCVTcxEy1MAGZb-7qiO','https://gridpic.tsing-tec.com/Fg2rGSXhSl3NX_HxB7QjHBMrkRd0','https://gridpic.tsing-tec.com/Fg2k4MtBh0bW06Vu418VeFq4l_B8','https://gridpic.tsing-tec.com/Fg2rGSXhSl3NX_HxB7QjHBMrkRd0']
    }
  },
  onLoad(){
    that = this;
  },
  cancle(){
    that.setData({
      auth:false
    })
  },
  like(e){
    console.log("like")
    let ifAuth = wx.getStorageSync('ifAuth')||false;
    if(ifAuth){
      that.setData({
        like:1
      })
    }else{
      that.setData({
        auth:true,
        callBack:function(){
          that.like(e)
        }
      })
    }
  },
  auth(e){
    console.log(3);
    wx.setStorageSync('ifAuth', true);
    that.setData({
      auth:false
    })
    that.data.callBack();    
  }
})