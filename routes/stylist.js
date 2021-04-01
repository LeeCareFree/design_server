/*
 * @Author: your name
 * @Date: 2021-03-25 16:55:36
 * @LastEditTime: 2021-04-01 17:26:28
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\routes\shopping.js
 */
const Router = require('koa-router');
const Stylist = new Router();
const StylistController = require('../controller/stylist');

Stylist.get('/api/stylist/login', StylistController.login)

module.exports = Stylist