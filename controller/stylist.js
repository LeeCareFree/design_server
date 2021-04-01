/*
 * @Author: your name
 * @Date: 2021-03-25 16:55:20
 * @LastEditTime: 2021-04-01 17:51:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\controller\shopping.js
 */
const hints = require('../bin/hints')
const dbHelper = require('../db/dpHelper')
const xss = require('node-xss').clean
let Stylist = dbHelper.getModel('stylist')
let Article = dbHelper.getModel('article')

class StylistController {
  constructor() {
    this.secret = 'lee' // 定义签名
    this.defaultAvatar = 'http://8.129.214.128:3001/avatar/lee.jpg'
    this.defaultBg = 'http://8.129.214.128:3001/imgs/defaultbg.jpg'
    this.login = this.login.bind(this)
  }

  mdsPassword(password) {
    let md5 = crypto.createHash('md5')
    let md5Pwd = md5.update(password).digest('hex')
    return md5Pwd
  }

  /**
   * 用户登录
   * @param {*} ctx
   * @param {*} next
   */
   async login(ctx, next) {
    try {
      const { username, password } = xss(ctx.request.body)
      var result = await Stylist.findOne({
        username: username,
      })
      if (result) {
        const { uid } = result
        if (this.mdsPassword(password) != result.password) {
          ctx.body = hints.LOGIN_PASSWORD_WRONG
        } else {
          const token = jwt.sign(
            {
              name: username,
              uid: uid,
            },
            this.secret,
            {
              expiresIn: '7d', //到期时间
            }
          )
          ctx.body = hints.SUCCESS({
            data: {
              username: result.username,
              nickname: result.nickname,
              avatar: this.defaultAvatar,
              bgimg: this.defaultBg,
              uid: result.uid,
              token: token,
            },
            msg: '登录成功',
          })
        }
      } else {
        ctx.body = hints.LOGIN_USER_NOT_EXIST
      }
    } catch (err) {
      await next()
    }
  }

  /**
   * 用户注册
   * @param {*} ctx
   * @param {*} next
   */
   async register(ctx) {
    try {
      ctx.append('content-type', 'application/json')
      let { username, password } = xss(ctx.request.body)
      const result = await User.findOne({
        username: username,
      })
      if (result) {
        ctx.body = hints.REGISTER_UNAVAILABLE
      } else {
        const result = await User.create({
          username: username,
          nickname: `用户${Math.random().toString(36).slice(-6)}`,
          password: new UserController().mdsPassword(password),
          avatar: this.defaultAvatar,
          uid: uuid.v4(),
        })
        if (result) {
          ctx.body = hints.SUCCESS({
            data: {
              username: username,
              avatar: this.defaultAvatar,
              uid: result.uid,
              nickname: result.nickname,
            },
            msg: '注册成功！',
          })
        }
      }
    } catch (err) {
      ctx.body = hints.FINDFAIL({
        data: err,
      })
      ctx.throw(err)
    }
  }
}

module.exports = new StylistController();