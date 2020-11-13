/*
 * @Author: your name
 * @Date: 2020-10-09 11:26:39
 * @LastEditTime: 2020-11-13 14:29:03
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\routes\users.js
 */
const UserController = require('../controller/user');
const Router = require('koa-router');
const User = new Router();

User.post('/api/users/login',  UserController.login);
User.post('/api/users/register',  UserController.register);
User.get('/api/users/userinfo',  UserController.getUserInfo);

module.exports = User