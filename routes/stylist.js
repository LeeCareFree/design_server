/*
 * @Author: your name
 * @Date: 2021-03-25 16:55:36
 * @LastEditTime: 2021-04-06 16:11:01
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\routes\shopping.js
 */
const Router = require('koa-router');
const Stylist = new Router();
const StylistController = require('../controller/stylist');

Stylist.post('/api/stylist/getlist', StylistController.getStylistList)

module.exports = Stylist