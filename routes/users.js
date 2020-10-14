const UserController = require('../controller/user');
const Router = require('koa-router');

const User = new Router();

User.post('/login',  UserController.login);
User.post('/register',  UserController.register);
User.get('/userinfo',  UserController.getUserInfo);

module.exports = User