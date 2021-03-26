/*
 * @Author: your name
 * @Date: 2021-03-25 16:55:36
 * @LastEditTime: 2021-03-25 16:57:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\routes\shopping.js
 */
const Router = require('koa-router');
const Shopping = new Router();
const ShoppingController = require('../controller/shopping');

Shopping.get('/api/shopping/icons/get', ShoppingController.getIcons)

module.exports = Shopping