/*
 * @Author: your name
 * @Date: 2020-10-09 11:26:39
 * @LastEditTime: Sat Apr 10 2021 16:21:40
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\controller\user.js
 */
'use strict'

const jwt = require('jsonwebtoken')
const xss = require('node-xss').clean
const dbHelper = require('../db/dpHelper')
let User = dbHelper.getModel('user')
let Admin = dbHelper.getModel('admin')
let Article = dbHelper.getModel('article')
let UserInfo = dbHelper.getModel('userinfo')
let DecoInfo = dbHelper.getModel('decorateinfo')
const hints = require('../bin/hints')
const crypto = require('crypto')
const uuid = require('node-uuid')
const path = require('path')

const {
  uploadFilePublic,
  deleteFilePublic,
  removeEmpty,
} = require('../utils/utils')
const {
  MongoUserAcountInfo
} = require('../utils/monCommon')
/**
 * user Controller
 * Post login
 * Post register
 * Get getUserInfo
 * Get userlist
 */
class UserController {
  constructor() {
    this.secret = 'lee' // 定义签名
    this.defaultAvatar = 'http://8.129.214.128:3001/avatar/lee.jpg'
    this.defaultBg = 'http://8.129.214.128:3001/imgs/defaultbg.jpg'
    this.login = this.login.bind(this)
    this.loginAdmin = this.loginAdmin.bind(this)
    this.register = this.register.bind(this)
    this.getAccountInfo = this.getAccountInfo.bind(this)
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
      const {
        username,
        password
      } = xss(ctx.request.body)
      var result = await User.findOne({
        username: username,
      })
      if (result) {
        const {
          uid
        } = result
        if (this.mdsPassword(password) != result.password) {
          ctx.body = hints.LOGIN_PASSWORD_WRONG
        } else {
          const token = jwt.sign({
              name: username,
              uid: uid,
            },
            this.secret, {
              expiresIn: '7d', //到期时间
            }
          )
          ctx.body = hints.SUCCESS({
            data: {
              username: result.username,
              nickname: result.nickname,
              avatar: result.avatar,
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
   * 管理登录
   * @param {*} ctx
   * @param {*} next
   */
  async loginAdmin(ctx, next) {
    try {
      const {
        username,
        password
      } = xss(ctx.request.body.data)
      var result = await Admin.findOne({
        username: username,
      })
      if (result) {
        if (this.mdsPassword(password) != result.password) {
          ctx.body = hints.LOGIN_PASSWORD_WRONG
        } else {
          const token = jwt.sign({
              name: username,
            },
            this.secret, {
              expiresIn: '7d', //到期时间
            }
          )
          ctx.body = hints.SUCCESS({
            data: {
              username: result.username,
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
      let {
        username,
        password,
        identity = 'user'
      } = xss(ctx.request.body)
      const result = await User.findOne({
        username: username,
      })
      if (result) {
        ctx.body = hints.REGISTER_UNAVAILABLE
      } else {
        let nickname,
          uid = uuid.v4()
        switch (identity) {
          case 'user':
            nickname = '用户'
            break
          case 'stylist':
            nickname = '设计'
            break
        }
        const identityObj = {
          username: username,
          nickname: `${nickname + Math.random().toString(36).slice(-6)}`,
          password: new UserController().mdsPassword(password),
          avatar: this.defaultAvatar,
          bgimg: this.defaultBg,
          uid,
          identity,
        }

        const result = await User.create(identityObj)
        if (identity === 'user') {
          await UserInfo.create({
            uid
          })
        } else {
          await DecoInfo.create({
            uid
          })
        }

        if (result) {
          ctx.body = hints.SUCCESS({
            data: {
              username: username,
              avatar: this.defaultAvatar,
              uid: result.uid,
              nickname: result.nickname,
              identity,
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
      const {
        uid
      } = ctx.request.body
      let result = await MongoUserAcountInfo(uid)
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
   * 设置用户信息
   * @param {*} ctx
   * @param {*} next
   */
  async setting(ctx, next) {
    try {
      let {
        uid,
        avatarUrl,
        bgimgUrl,
        nickname,
        gender,
        introduction,
        city,
      } = ctx.request.body
      let files = ctx.request.files
      let aurl, burl, avatar, bgimg
      if (files) {
        avatar = files.avatar
        bgimg = files.bgimg
      }

      if (!uid || !avatarUrl || !nickname) {
        return (ctx.body = hints.CREATEFAIL({
          data: '必传参数未传！',
          msg: '设置失败！',
        }))
      }

      if (avatar) {
        let basename = path.basename(avatarUrl)
        let regx = /^lee\.jpg$/g
        if (!regx.test(basename)) {
          deleteFilePublic(avatarUrl, 'avatar')
        }
        aurl = uploadFilePublic(
          ctx,
          avatar,
          uid + '_' + new Date() * 1,
          'avatar'
        )
      }
      if (bgimg) {
        let basename = path.basename(bgimgUrl)
        let regx = /^defaultbg\.jpg$/g
        if (!regx.test(basename)) {
          deleteFilePublic(bgimgUrl, 'bgimg')
        }
        burl = uploadFilePublic(ctx, bgimg, uid + '_' + new Date() * 1, 'bgimg')
      }

      let userObj = {
        nickname,
        avatar: aurl,
        bgimg: burl,
        introduction,
        city,
        gender: gender && parseInt(gender),
      }

      // 移除空属性
      removeEmpty(userObj)

      let result = await User.updateOne({
        uid
      }, userObj)

      if (result.nModified) {
        let userAcountInfo = await MongoUserAcountInfo(uid)
        ctx.body = hints.SUCCESS({
          data: userAcountInfo,
          msg: '更新成功！',
        })
      } else {
        ctx.body = hints.UPDATE({
          msg: '未做更改',
        })
      }
    } catch (err) {
      await next()
    }
  }

  async setupDetails(ctx, next) {
    try {
      let {
        identity = 'user',
          uid,
          city,
          cost,
          progress,
          doorModel,
          area,
          populace,
          beginTime,
          checkInTime,

          address, // 详细地址
          stylearr, // 风格
          designfee, // 费用
          phone, // 联系方式
          service, // 服务介绍
      } = ctx.request.body

      let result
      switch (identity) {
        case 'user':
          let userInfoObj = {
            city,
            cost,
            progress,
            doorModel,
            area,
            populace,
            beginTime,
            checkInTime,
          }
          removeEmpty(userInfoObj)
          result = await UserInfo.updateOne({
            uid
          }, userInfoObj).then(
            (res) => {
              if (res.nModified) {
                return UserInfo.findOne({
                  uid
                })
              }
            }
          )
          break
        case 'stylist':
          let stylistInfo = {
            city, // 服务城市
            address,
            stylearr,
            designfee: designfee && iparseInt(designfee),
            phone,
            service,
          }
          removeEmpty(stylistInfo)
          console.log(stylistInfo)
          result = await DecoInfo.updateOne({
            uid
          }, stylistInfo).then(
            (res) => {
              if (res.nModified) {
                return DecoInfo.findOne({
                  uid
                })
              }
            }
          )
          break
      }
      if (result) {
        ctx.body = hints.SUCCESS({
          data: result,
          msg: '更新成功！',
        })
      } else {
        ctx.body = hints.UPDATE({
          msg: '未做更改',
        })
      }
    } catch (err) {
      next()
    }
  }

  async getDetailInfo(ctx, next) {
    try {
      let {
        uid,
        identity = 'user'
      } = ctx.request.body
      let result
      switch (identity) {
        case 'user':
          result = await UserInfo.findOne({
            uid
          })
          break
        case 'stylist':
          result = await DecoInfo.findOne({
            uid
          })
        default:

          break
      }
      if (result) {
        ctx.body = hints.SUCCESS({
          data: result,
          msg: '获取详情信息成功！',
        })
      }
    } catch (err) {
      next()
    }
  }

  /**
   * 通过数组拿对应的列表
   * 作品、喜欢、收藏、关注、粉丝
   * @param {*} ctx
   */
  async getListByArr(ctx) {
    let {
      uid,
      arrname = 'production',
      page = 1,
      size = 10
    } = ctx.request.body
    let result = await User.findOne({
        uid
      })
      .then((res) => {
        switch (arrname) {
          case 'production':
            return res.proArr
          case 'like':
            return res.likeArr
          case 'collection':
            return res.collArr
          case 'follow':
            return res.followArr
          case 'fans':
            return res.fansArr
        }
      })
      .then((arrData) => {
        switch (arrname) {
          case 'production':
          case 'like':
          case 'collection':
            return Article.aggregate([{
                $match: {
                  aid: {
                    $in: arrData
                  },
                },
              },
              {
                $skip: Number(page - 1) * Number(size),
              },
              {
                $limit: Number(size),
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'uid',
                  foreignField: 'uid',
                  as: 'user',
                },
              },
              {
                $unwind: '$user'
              },
              {
                $project: {
                  _id: 0,
                  __v: 0,
                  uid: 0,
                  desc: 0,
                  decoratestyle: 0,
                  decorateduration: 0,
                  decorateother: 0,
                  'user._id': 0,
                  'user.__v': 0,
                  'user.password': 0,
                  'user.likeArr': 0,
                  'user.collArr': 0,
                  'user.proArr': 0,
                  'user.followArr': 0,
                  'user.fansArr': 0,
                },
              },
            ])
          case 'follow':
          case 'fans':
            return User.find({
              uid: {
                $in: arrData
              }
            }).then((users) => {
              if (users) {
                let userArr = []
                // 每个用户
                users.forEach((user) => {
                  let u = {
                    avatar: user.avatar,
                    nickname: user.nickname,
                    username: user.username,
                    uid: user.uid,
                  }
                  let followArr = user.followArr
                  let fansArr = user.fansArr
                  if (arrname === 'fans') {
                    fansArr.indexOf(uid) >= 0 ?
                      (u.isFocus = true) :
                      (u.isFocus = false)
                  } else if (arrname === 'follow') {
                    followArr.indexOf(uid) >= 0 ?
                      (u.isFocus = true) :
                      (u.isFocus = false)
                  }
                  userArr.push(u)
                })
                return userArr
              } else {
                return users
              }
            })
        }
      })
    if (result) {
      ctx.body = hints.SUCCESS({
        data: arrname === 'follow' || arrname === 'fans' ? {
          result
        } : result,
        msg: '获取成功',
      })
    } else {
      ctx.body = hints.FINDFAIL({
        msg: '获取失败'
      })
    }
  }

  /**
   * @description: 添加操作
   * @param {*} ctx
   * type 0--点赞 1--收藏
   * @return {*}
   */
  async addOperation(ctx) {
    let {
      aid,
      uid,
      type
    } = ctx.request.body

    if (!aid || !uid || !type) {
      return (ctx.body = hints.PARAM_ERROR)
    }
    type = parseInt(type)
    let userResult,
      returnStatement = ['点赞', '收藏']
    switch (type) {
      case 0:
        userResult = await User.updateOne({
          uid
        }, {
          $addToSet: {
            likeArr: aid
          }
        })
        if (userResult.nModified)
          await Article.updateOne({
            aid
          }, {
            $inc: {
              like: 1
            },
          })
        break
      case 1:
        userResult = await User.updateOne({
          uid
        }, {
          $addToSet: {
            collArr: aid
          }
        })
        if (userResult.nModified)
          await Article.updateOne({
            aid
          }, {
            $inc: {
              coll: 1
            },
          })
        break
    }

    if (userResult.nModified) {
      ctx.body = hints.SUCCESS({
        msg: `${returnStatement[type]}成功！`
      })
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
    let {
      aid,
      uid,
      type
    } = ctx.request.body

    if (!aid || !uid || !type) {
      return (ctx.body = hints.PARAM_ERROR)
    }
    type = parseInt(type)
    let userResult,
      returnStatement = ['点赞', '收藏']
    switch (type) {
      case 0:
        userResult = await User.updateOne({
          uid: uid
        }, {
          $pull: {
            likeArr: {
              $in: [aid]
            }
          }
        })
        if (userResult.nModified)
          await Article.find({
            aid
          }).update({
            like: {
              $gt: 0
            },
          }, {
            $inc: {
              like: -1
            }
          })
        break
      case 1:
        userResult = await User.updateOne({
          uid: uid
        }, {
          $pull: {
            collArr: {
              $in: [aid]
            }
          }
        })
        if (userResult.nModified)
          await Article.find({
            aid
          }).update({
            coll: {
              $gt: 0
            },
          }, {
            $inc: {
              coll: -1
            }
          })
        break
    }

    if (userResult.nModified) {
      ctx.body = hints.SUCCESS({
        msg: `取消${returnStatement[type]}成功！`
      })
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
    let {
      aid,
      uid,
      type
    } = ctx.request.body
    if (!aid || !uid || !type) {
      return (ctx.body = hints.PARAM_ERROR)
    }
    type = parseInt(type)
    let result,
      returnStatement = ['点赞', '收藏']

    switch (type) {
      case 0:
        result = await User.find({
          uid
        }).findOne({
          likeArr: {
            $elemMatch: {
              $eq: aid
            }
          },
        })
        break
      case 1:
        result = await User.find({
          uid
        }).findOne({
          collArr: {
            $elemMatch: {
              $eq: aid
            }
          },
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
    let {
      muid,
      huid
    } = ctx.request.body
    if (!muid || !huid) {
      return (ctx.body = hints.PARAM_ERROR)
    }
    // 关注者存被关注者的uid
    let myResult = await User.updateOne({
      uid: muid
    }, {
      $addToSet: {
        followArr: huid
      }
    })
    // 被关注者存关注者uid
    await User.updateOne({
      uid: huid
    }, {
      $addToSet: {
        fansArr: muid
      }
    })
    if (myResult.nModified) {
      ctx.body = hints.SUCCESS({
        msg: '关注成功！'
      })
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
    let {
      muid,
      huid
    } = ctx.request.body
    if (!muid || !huid) {
      return (ctx.body = hints.PARAM_ERROR)
    }
    // 关注者删除被关注者的uid
    let myResult = await User.updateOne({
      uid: muid
    }, {
      $pull: {
        followArr: {
          $in: [huid]
        }
      }
    })
    // 被关注者删除关注者uid
    await User.updateOne({
      uid: huid
    }, {
      $pull: {
        fansArr: {
          $in: [muid]
        }
      }
    })
    if (myResult.nModified) {
      ctx.body = hints.SUCCESS({
        msg: '取消关注成功！'
      })
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
    let {
      muid,
      huid
    } = ctx.request.body
    if (!muid || !huid) {
      return (ctx.body = hints.PARAM_ERROR)
    }

    let result = await User.find({
      uid: muid
    }).findOne({
      followArr: {
        $elemMatch: {
          $eq: huid
        }
      },
    })

    ctx.body = hints.SUCCESS({
      data: !!result,
      msg: `查询关注状态成功`,
    })
  }
}

module.exports = new UserController()