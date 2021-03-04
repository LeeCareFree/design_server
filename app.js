/*
 * @Author: your name
 * @Date: 2020-10-09 11:26:39
 * @LastEditTime: 2020-11-13 19:49:54
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\app.js
 */
const Koa = require('koa')
const app = new Koa()
const parameter = require('koa-parameter');
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const conditional = require('./middleware/conditionalParameters');
const users = require('./routes/users');
const home = require('./routes/home');
const jwtKoa = require('koa-jwt');
const {secret} = require('./bin/config');
const checkToken  = require('./middleware/checkToken');
const db = require('./db/dbConnect')
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('db success');
});
// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))
app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))
app.use(jwtKoa({
  secret: secret
}).unless({
  path: [/^\/api\/users\/login/,/^\/api\/users\/register/]
}));
app.use(checkToken());
// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

app.use(users.routes(), users.allowedMethods())
app.use(home.routes(), home.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});
app.use(conditional(app));
app.use(parameter(app))
module.exports = app
