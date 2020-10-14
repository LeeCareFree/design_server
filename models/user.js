/*
 * @Author: your name
 * @Date: 2020-10-09 11:26:39
 * @LastEditTime: 2020-10-12 17:47:51
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\models\user.js
 */
"use strict";

/**
 * 用户模型
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: false,
    trim: true,
  },
  //用户名
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  //密码
  password: {
    type: String,
    required: true,
  },
  avatarURL: String, //用户头像
  photo: {
    //手机号
    type: String,
    min: 10,
    max: 20,
  },
  isadmin: Boolean, //是否为管理员
  regtime: {
    //创建时间
    type: Date,
    default: Date.now,
  },
});
UserSchema.statics = {
  async authenticateBasic(auth) {
    let query = { username: auth.username };
    return this.findOne(query)
      .then((user) => {
        return user.comparePassword(auth.password);
      })
      .catch((error) => {
        throw error;
      });
  },
  /* 查找 */
  async findUser(data = {}) {
    const result = await this.find(data);
    return result;
  },
  /* 创建用户 */
  async createUser(data = {}) {
    const result = await this.create(data);
    return result;
  },
};
UserSchema.methods.comparePassword = function (password) {
  return bcrypt
    .compare(password, this.password)
    .then((isValid) => (isValid ? this : null));
};

UserSchema.pre("save", function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});
const UserModel = mongoose.model("user", UserSchema);

module.exports = UserModel;
