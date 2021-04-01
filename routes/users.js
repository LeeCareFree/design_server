/*
 * @Author: your name
 * @Date: 2020-10-09 11:26:39
 * @LastEditTime: 2021-04-01 13:28:27
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\routes\users.js
 */
const UserController = require('../controller/user');
const Router = require('koa-router');
const User = new Router();

User.post('/api/users/login',  UserController.login);
User.post('/api/admin/login', UserController.loginAdmin);
User.post('/api/users/register',  UserController.register);
User.get('/api/users/accountInfo',  UserController.getAccountInfo);
User.post('/api/users/operation/add', UserController.addOperation);
User.post('/api/users/operation/cancel', UserController.cancelOperation);
User.post('/api/users/operation/query', UserController.queryStatus);
User.post('/api/users/follow/add', UserController.addFollow);
User.post('/api/users/follow/cancel', UserController.cancelFollow);
User.post('/api/users/follow/query', UserController.queryFollow);
User.post('/api/users/getarrlist', UserController.getListByArr);


module.exports = User