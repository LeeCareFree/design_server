/*
 * @Author: your name
 * @Date: 2020-10-09 11:26:39
 * @LastEditTime: 2021-03-17 15:17:32
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\controller\user.js
 */
'use strict'

const jwt = require('jsonwebtoken')
const xss = require('node-xss').clean
const dbHelper = require('../db/dpHelper')
let User = dbHelper.getModel('user')
let Article = dbHelper.getModel('article')
const hints = require('../bin/hints')
const crypto = require('crypto')
const uuid = require('node-uuid')
/**
 * user Controller
 * Post login
 * Post register
 * Get getUserInfo
 * Get userlist
 */
class UserController {
  constructor() {
    this.secret = "lee"; // 定义签名
    this.defaultAvatar = 'http://192.168.0.105:3000/avatar/lee.jpg';
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.getAccountInfo = this.getAccountInfo.bind(this);
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
      var result = await User.findOne({
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

  /**
   * 获取用户信息
   * @param {*} ctx
   * @param {*} next
   */
  async getAccountInfo(ctx) {
    try {
      const { uid } = ctx.state.user
      const result = await User.findOne({
        uid: uid,
      })
      if (result) {
        ctx.body = hints.SUCCESS({
          data: result,
          msg: '获取用户信息成功！',
        })
      } else {
        ctx.body = {
          code: 1,
          msg: User.USER_LOGIN,
        }
      }
    } catch (err) {
      ctx.body = hints.FINDFAIL({
        data: err,
      })
      ctx.throw(err)
    }
  }

  /**
   * @description: 添加收藏
   * @param {*} ctx
   * @return {*}
   */
  async addCollecttion(ctx) {
    let { aid, uid } = ctx.request.body

    await User.updateOne({ uid: uid }, { $addToSet: { aid } })

    // await Article.updateOne
  }

  /**
   * @description: 取消收藏
   * @param {*} ctx
   * @return {*}
   */
  async cancelCollection(ctx) {}
}

module.exports = new UserController()
