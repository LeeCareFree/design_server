const jwt = require('jsonwebtoken')
const Promise = require('bluebird')
const verify = Promise.promisify(jwt.verify)
const { secret } = require('../bin/config')
const hints = require('../bin/hints')

const xss = require('node-xss').clean
/**
 * token Controller
 * Post checkToken
 */
class TokenController {
  constructor() {
    this.checkToken = this.checkToken.bind(this)
  }

  /**
   * 检查token
   * @param {*} ctx
   * @param {*} next
   */
  async checkToken(ctx, next) {
    try {
      let token = ctx.header.authorization
      if (token) {
        try {
          ctx.body = {
            code: 200,
            msg: 'token检查成功！',
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
      }
      await next()
    } catch (err) {
      ctx.body = err
    }
  }
}

module.exports = new TokenController()
