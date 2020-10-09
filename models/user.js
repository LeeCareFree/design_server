"use strict"

/**
 * 用户模型
 */

const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const UserSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: false,
        trim: true
    },
    //用户名
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    //密码
    password: {
        type: String,
        required: true
    },
    avatarURL: String, //用户头像
    photo: { //手机号
        type: String,
        min: 10,
        max: 20
    },
    isadmin: Boolean, //是否为管理员
    regtime: { //创建时间
        type: Date,
        default: Date.now
    }
});

UserSchema.statics = {
    /* 查找 */
    async findUser(data = {}) {
        const result = await this.find(data);
        return result
    },
    /* 创建用户 */
    async createUser(data = {}) {
        const result = await this.create(data);
        return result;
    }
}
UserSchema.pre('save',function(next){
    var user=this;
    bcrypt.hash(user.password,10,function(err,hash){
        if(err){
            return next(err);
        }
        user.password=hash;
        next();
    })
});
const UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel