/*
 * @Author: your name
 * @Date: 2020-10-09 11:26:39
 * @LastEditTime: 2021-03-17 19:27:29
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
   * @description: 添加操作
   * @param {*} ctx
   * type 0--点赞 1--收藏
   * @return {*}
   */
  async addOperation(ctx) {
    let { aid, uid, type } = ctx.request.body

    if (!aid || !uid || !type) {
      return (ctx.body = hints.PARAM_ERROR)
    }
    type = parseInt(type)
    let userResult,
      returnStatement = ['点赞', '收藏']
    switch (type) {
      case 0:
        userResult = await User.updateOne(
          { uid },
          { $addToSet: { likeArr: aid } }
        )
        await Article.updateOne(
          { aid },
          {
            $inc: { like: 1 },
          }
        )
        break
      case 1:
        userResult = await User.updateOne(
          { uid },
          { $addToSet: { collArr: aid } }
        )
        await Article.updateOne(
          { aid },
          {
            $inc: { coll: 1 },
          }
        )
        break
    }

    if (userResult.nModified) {
      ctx.body = hints.SUCCESS({ msg: `${returnStatement[type]}成功！` })
    } else {
      ctx.body = hints.FRONT_ALREADY({
        msg: `您已${returnStatement[type]}成功！`,
      })
    }
  }

  /**
   * @description: 取消操作
   * @param {*} ctx
   * @return {*}
   */
  async cancelOperation(ctx) {
    let { aid, uid, type } = ctx.request.body

    if (!aid || !uid || !type) {
      return (ctx.body = hints.PARAM_ERROR)
    }
    type = parseInt(type)
    let userResult,
      returnStatement = ['点赞', '收藏']
    switch (type) {
      case 0:
        userResult = await User.updateOne(
          { uid: uid },
          { $pull: { likeArr: { $in: [aid] } } }
        )
        await Article.find({ aid }).update(
          {
            like: { $gt: 0 },
          },
          { $inc: { like: -1 } }
        )
        break
      case 1:
        userResult = await User.updateOne(
          { uid: uid },
          { $pull: { collArr: { $in: [aid] } } }
        )
        await Article.find({ aid }).update(
          {
            coll: { $gt: 0 },
          },
          { $inc: { coll: -1 } }
        )
        break
    }

    if (userResult.nModified) {
      ctx.body = hints.SUCCESS({ msg: `取消${returnStatement[type]}成功！` })
    } else {
      ctx.body = hints.FRONT_ALREADY({
        msg: `您已取消${returnStatement[type]}！`,
      })
    }
  }

  /**
   * @description: 查询是否收藏
   * @param {*} ctx
   * @return {*}
   */
  async queryStatus(ctx) {
    let { aid, uid, type } = ctx.request.body
    if (!aid || !uid || !type) {
      return (ctx.body = hints.PARAM_ERROR)
    }
    type = parseInt(type)
    let result,
      returnStatement = ['点赞', '收藏']

    switch (type) {
      case 0:
        result = await User.find({ uid }).findOne({
          likeArr: { $elemMatch: { $eq: aid } },
        })
        break
      case 1:
        result = await User.find({ uid }).findOne({
          collArr: { $elemMatch: { $eq: aid } },
        })
        break
    }

    ctx.body = hints.SUCCESS({
      data: !!result,
      msg: `查询${returnStatement[type]}状态成功`,
    })
  }

  /**
   * @description: 添加关注
   * @param {*} ctx
   * @return {*}
   */
  async addFollow(ctx) {
    let { muid, huid } = ctx.request.body
    if (!muid || !huid) {
      return (ctx.body = hints.PARAM_ERROR)
    }
    // 关注者存被关注者的uid
    let myResult = await User.updateOne(
      { uid: muid },
      { $addToSet: { followArr: huid } }
    )
    // 被关注者存关注者uid
    await User.updateOne({ uid: huid }, { $addToSet: { fansArr: muid } })
    if (myResult.nModified) {
      ctx.body = hints.SUCCESS({ msg: '关注成功！' })
    } else {
      ctx.body = hints.FRONT_ALREADY({
        msg: `您已关注该用户！`,
      })
    }
  }

  /**
   * @description: 取消关注
   * @param {*} ctx
   * @return {*}
   */
  async cancelFollow(ctx) {
    let { muid, huid } = ctx.request.body
    if (!muid || !huid) {
      return (ctx.body = hints.PARAM_ERROR)
    }
    // 关注者删除被关注者的uid
    let myResult = await User.updateOne(
      { uid: muid },
      { $pull: { followArr: { $in: [huid] } } }
    )
    // 被关注者删除关注者uid
    await User.updateOne({ uid: huid }, { $pull: { fansArr: { $in: [muid] } } })
    if (myResult.nModified) {
      ctx.body = hints.SUCCESS({ msg: '取消关注成功！' })
    } else {
      ctx.body = hints.FRONT_ALREADY({
        msg: `您已取消关注该用户！`,
      })
    }
  }

  /**
   * @description: 查询是否关注
   * @param {*} ctx
   * @return {*}
   */
  async queryFollow(ctx) {
    let { muid, huid } = ctx.request.body
    if (!muid || !huid) {
      return (ctx.body = hints.PARAM_ERROR)
    }

    let result = await User.find({ uid: muid }).findOne({
      followArr: { $elemMatch: { $eq: huid } },
    })

    ctx.body = hints.SUCCESS({
      data: !!result,
      msg: `查询关注状态成功`,
    })
  }
}

module.exports = new UserController()
