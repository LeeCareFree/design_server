// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');
//注意require('koa-router')返回的是函数:
//设置跨域
const cors = require('koa2-cors'); //跨域处理
//导入post请求参数处理的插件
const bodyParser = require('koa-bodyparser');
// 引入静态资源中间件，静态web服务
const staticResource = require('koa-static');
// 引入node的path模块
const path = require('path')
var fs = require('fs');
// 创建一个Koa对象表示web app本身:
const app = new Koa();
app.use(cors());
// add router middleware:
app.use(bodyParser());
//配置静态资源中间件
app.use(staticResource(path.join(__dirname,'download')))

// 在端口3000监听:
app.listen(3000);
console.log('服务器创建储成功，启动的端口是3000');
