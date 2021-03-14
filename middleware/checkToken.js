/*
 * @Author: your name
 * @Date: 2020-11-13 15:25:02
 * @LastEditTime: 2021-03-14 15:21:35
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\middleware\checkToken.js
 */
const jwt = require('jsonwebtoken')
const Promise = require('bluebird')
const verify = Promise.promisify(jwt.verify)
const { secret } = require('../bin/config')
const hints = require('../bin/hints')
// 检验token
module.exports = function () {
  return async (ctx, next) => {
    try {
      if (
        ctx.request.url.indexOf('login') >= 0 ||
        ctx.request.url.indexOf('register') >= 0
      ) {
        return await next()
      } else {
        let token = ctx.header.authorization
        if (token) {
          let payload
          try {
            payload = await verify(token.split(' ')[1], secret)
            ctx.user = {
              username: payload.username,
              id: payload.id,
            }
          } catch (err) {
            if (err.name == 'TokenExpiredError') {
              //token过期
              throw (err = hints.TOKEN_EXPIRED)
            } else if (err.name == 'JsonWebTokenError') {
              //无效的token
              throw (err = hints.TOKEN_INVALID)
            }
          }
        } else {
          throw (err = hints.TOKEN_NOEXIST)
        }
        await next()
      }
    } catch (err) {
      ctx.body = err
    }
  }
}
