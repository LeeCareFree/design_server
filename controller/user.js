/*
 * @Author: your name
 * @Date: 2020-10-09 11:26:39
 * @LastEditTime: 2020-10-14 14:00:55
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\controller\user.js
 */
"use strict";

const UserModel = require("../mongoose/dbConnect");
const jwt = require("jsonwebtoken");
const config = require("../bin/config");
const User = require("../constant/user");
/**
 * user Controller
 * Post login
 * Post register
 * Get getUserInfo
 * Get userlist
 */
class UserController {
  constructor() {
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);
    this.userlist = this.userlist.bind(this);
  }

  /**
   * 用户登录
   * @param {*} ctx
   * @param {*} next
   */
  async login(ctx, next) {
    try {
      const { username, password } = ctx.request.body;
      var result = await UserModel.authenticateBasic({
        username: username,
        password: password,
      });
      if (ctx.state.user) {
        const token = jwt.sign(
          {
            id: result._id,
            username: username,
          },
          config.secret,
          {
            expiresIn: "100h", //到期时间
          }
        );
        ctx.body = {
          code: 0,
          data: {
            token,
            username,
          },
          msg: User.LOGIN_SUCCESS,
        };
      } else {
        ctx.body = {
          code: 1,
          msg: User.LOGIN_FAIL,
        };
      }
    } catch (err) {
      console.log(err);
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
      console.log(ctx.request.body);
      const { username, password, email, isadmin } = ctx.request.body;
      const result = await UserModel.findUser({
        username: username,
      });
      if (result[0]) {
        ctx.body = {
          code: 1,
          msg: User.USER_REGISTERED,
          data: result[0],
        };
      } else {
        const result = await UserModel.createUser({
          username: username,
          password: password,
          email: email || "",
          isadmin: isadmin || false,
        });
        if (result) {
          ctx.body = {
            code: 0,
            msg: User.REGISTER_SUCCESS,
            data: {
              username: username,
            },
          };
        } else {
          ctx.body = {
            code: 1,
            msg: User.REGISTER_FAIL,
            data: {},
          };
        }
      }
    } catch (err) {
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
      console.log(ctx.state.user);
      const { id, user } = ctx.state;
      const result = await UserModel.findUser({
        _id: id,
        user: user,
      });
      console.log(result);
      if (result[0] && result[0].isadmin) {
        ctx.body = {
          code: 0,
          desc: User.SUCCESS,
          data: result[0],
        };
      } else {
        ctx.body = {
          code: 1,
          desc: User.USER_LOGIN,
        };
      }
    } catch (err) {
      ctx.throw(err);
    }
  }

  /**
   * 获取用户列表
   * @param {*} ctx
   * @param {*} next
   */
  async userlist(ctx) {
    try {
      let data = await UserModel.findUser({});
      ctx.body = {
        code: 0,
        desc: User.SUCCESS,
        data: data,
      };
    } catch (err) {
      ctx.throw(err);
    }
  }
}

module.exports = new UserController();
