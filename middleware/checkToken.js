/*
 * @Author: your name
 * @Date: 2020-11-13 15:25:02
 * @LastEditTime: 2020-11-13 19:46:24
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\middleware\checkToken.js
 */
const jwt = require("jsonwebtoken");
const Promise = require("bluebird");
const verify = Promise.promisify(jwt.verify);
const { secret } = require("../bin/config");
const hints = require("../bin/hints");
// 检验token
module.exports = function () {
  return async (ctx, next) => {
    try {
      let token = ctx.header.authorization;
      if (token) {
        let payload;
        try {
          payload = await verify(token.split(" ")[1], secret);
          ctx.user = {
            username: payload.username,
            id: payload.id,
          };
        } catch (err) {
          console.log("token验证失败", err);
        }
      }
      await next();
    } catch (err) {
      if (err.status == 401) {
        ctx.status = 401;
        ctx.body = hints.TOKEN_EXPIRED;
      } else {
        ctx.status = 404;
        ctx.body = hints.NOT_FOUND;
      }
    }
  };
};
