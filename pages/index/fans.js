var that;
const app = getApp();
Page({
  data:{
    prompt:false,
    detail:{
      id:4,
      nickName:"青梦蓝宇",
      createTime:"10月28日 21:08",
      content:"今天是真宝宝出生的第一天哦，长得有点难看，哈哈！今天是真宝宝出生的第一天哦，长得有点难看，哈哈！今天是真宝宝出生的第一天哦，长得有点难看，哈哈！（最多不超过150字) ",
      images:['https://gridpic.tsing-tec.com/3463142a-24b9-4f10-a214-3adf25e6980f.jpg','https://gridpic.tsing-tec.com/325054bc-0552-429a-a267-c65b961778ab.png','https://gridpic.tsing-tec.com/Fg3dOpl7L8VOjZutViKmR9WkM4Xa','https://gridpic.tsing-tec.com/Fg3Q63iBiCGeyFeSLfe420l2kzMr','https://gridpic.tsing-tec.com/Fg2tasndqknDqgD2RQkfAOyp4dFj','https://gridpic.tsing-tec.com/Fg2sPW4hpqCVTcxEy1MAGZb-7qiO','https://gridpic.tsing-tec.com/Fg2rGSXhSl3NX_HxB7QjHBMrkRd0','https://gridpic.tsing-tec.com/Fg2k4MtBh0bW06Vu418VeFq4l_B8','https://gridpic.tsing-tec.com/Fg2rGSXhSl3NX_HxB7QjHBMrkRd0']
    }
  },
  onLoad(){
    that = this;
  },
  follow(){
    that.setData({
      prompt:true
    })
  },
  back(){
    wx.reLaunch({
      url: '/pages/index/index',
    })
  }

})