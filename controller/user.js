/*
 * @Author: your name
 * @Date: 2020-10-09 11:26:39
 * @LastEditTime: 2020-11-13 19:58:07
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\controller\user.js
 */
"use strict";

const jwt = require("jsonwebtoken");
const xss = require("node-xss").clean;
const dbHelper = require("../db/dpHelper");
let User = dbHelper.getModel("user");
const hints = require("../bin/hints");
const crypto = require("crypto");
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
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);
  }

  mdsPassword(password) {
    let md5 = crypto.createHash("md5");
    let md5Pwd = md5.update(password).digest("hex");
    return md5Pwd;
  }

  /**
   * 用户登录
   * @param {*} ctx
   * @param {*} next
   */
  async login(ctx, next) {
    try {
      const { username, password } = xss(ctx.request.body);
      var result = await User.findOne({
        username: username,
      });
      if (result) {
        if (this.mdsPassword(password) != result.password) {
          ctx.body = hints.LOGIN_PASSWORD_WRONG;
        } else {
          const token = jwt.sign(
            {
              name: username,
            },
            this.secret,
            {
              expiresIn: 60000, //秒到期时间
            }
          );
          ctx.body = hints.SUCCESS({
            data: {
              username: username,
              token: token,
            },
            msg: "登录成功",
          });
        }
      } else {
        ctx.body = hints.LOGIN_USER_NOT_EXIST;
      }
    } catch (err) {
      await next();
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
      let { username, password } = xss(ctx.request.body);
      const result = await User.findOne({
        username: username,
      });
      if (result) {
        ctx.body = hints.REGISTER_UNAVAILABLE;
      } else {
        const result = await User.create({
          username: username,
          password: new UserController().mdsPassword(password),
        });
        if (result) {
          ctx.body = hints.SUCCESS({
            data: {
              username: username,
            },
            msg: "注册成功！",
          });
        }
      }
    } catch (err) {
      ctx.body = hints.FINDFAIL({
        data: err,
      });
      ctx.throw(err);
    }
  }

  /**
   * 获取用户信息
   * @param {*} ctx
   * @param {*} next
   */
  async getUserInfo(ctx) {
    try {
      const { name } = ctx.state.user;
      const result = await User.findOne({
        username: name,
      });
      if (result) {
        ctx.body = hints.SUCCESS({
          data: result,
          msg: "获取用户信息成功！"
        })
      } else {
        ctx.body = {
          code: 1,
          msg: User.USER_LOGIN,
        };
      }
    } catch (err) {
      ctx.body = hints.FINDFAIL({
        data: err,
      });
      ctx.throw(err);
    }
  }
}

module.exports = new UserController();
