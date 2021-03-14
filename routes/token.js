const TokenController = require('../controller/token');
const Router = require('koa-router');
const Token = new Router();
Token.post('/api/token/checkToken',TokenController.checkToken);
module.exports = Token;