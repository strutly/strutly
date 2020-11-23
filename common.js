/**
 *
 * Page扩展函数
 *
 * @param {*} Page 原生Page
 */

const pageExtend = Page => {
  return object => {      
    object.back=()=>{
      wx.navigateBack({
        delta: -1,
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
    object.switchTabbar=(e)=> {
      let tabs = ['/pages/index/index','/pages/index/my'];
      let i = e.currentTarget.dataset.index;
      let index = e.currentTarget.dataset.stu;
      if(i!=index){
        wx.reLaunch({
          url: tabs[i],
        })
      }
    }    
    return Page(object)
  }
}

// 获取原生Page
const originalPage = Page
// 定义一个新的Page，将原生Page传入Page扩展函数
Page = pageExtend(originalPage)
console.log(Page)
