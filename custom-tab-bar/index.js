const app = getApp();
const api = require("../config/api");
Component({
  data: {
    num:0,
    color: "#515151",
    selectedColor: "#FFB13B",
    backgroundColor: "#ffffff",
    list: [
      {
        "pagePath": "/pages/index/index",
        "text": "首页",
        "iconPath": "/images/home1.png",
        "selectedIconPath": "/images/home0.png"
      },
      {
        "pagePath": "/pages/index/form",
        "text": "发布",
        "bulge":true,
        "iconPath": "/images/publish.png",
        "selectedIconPath": "/images/publish.png"
      },      
      {
        "pagePath": "/pages/index/my",
        "text": "我的",
        "iconPath": "/images/my0.png",
        "selectedIconPath": "/images/my1.png"
      }
    ]
  },
  ready() {
    this.getNum();
  },  
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.url;
      if(url!='/pages/index/form'){
        app.globalData.url = url;
      }
      wx.switchTab({url}) 
    },
    async getNum(){
      var that = this;
      let ifAuth = wx.getStorageSync('ifAuth')||false;
      if(ifAuth){
        let res = await api.notice({});
        that.setData({
          num:res.data.length||0
        });        
      }
    }
  }
})