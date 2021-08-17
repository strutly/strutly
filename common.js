/**
 *
 * Page扩展函数
 *
 * @param {*} Page 原生Page
 */
const pageExtend = Page => {

  return object => {      
    //返回
    object.back=()=>{
      if (getCurrentPages().length > 1) {
        wx.navigateBack({
          delta: 1,
        })
      }
    },

    object.home=()=>{    
      wx.switchTab({
        url: '/pages/index/index',
      })
    },
    object.toUrl=(e)=>{
      let url = e.currentTarget.dataset.url;
      if(url){
        wx.navigateTo({
          url: url,
        })
      }    
    },
    object.reLoad=(e)=>{      
      let currentPages = getCurrentPages();
      if (currentPages.length != 0) {
        let options = currentPages[currentPages.length - 1].data.options || {};
        //刷新当前页面的数据
        currentPages[currentPages.length - 1].onLoad(options);
      }
    } 
    return Page(object)
  }
}
// 获取原生Page
const originalPage = Page;
// 定义一个新的Page，将原生Page传入Page扩展函数
Page = pageExtend(originalPage)

