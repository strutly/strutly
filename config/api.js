const domain = "https://mini.strutly.cn";
//const domain = "http://localhost";
module.exports = {
  Login: domain + '/api/login',//登录接口
  Auth: domain + '/api/auth', //授权接口
  Record:domain + '/wxs/record',//说说接口
  Comment:domain + '/wxs/comment',//说说评论点赞分享
  QINIU:domain + '/api/qiniu/token',//七牛token
  MyInfo:domain + '/wxs/user',
  Fans:domain + '/wxs/fans',
  Notice:domain + '/wxs/notice',
  Black:domain + '/wxs/black',
  QiniuBase64:domain + '/api/qiniu/base64'
}