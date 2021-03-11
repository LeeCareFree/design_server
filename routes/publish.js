/*
 * @Author: your name
 * @Date: 2021-03-10 14:44:42
 * @LastEditTime: 2021-03-11 10:34:39
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\routes\publish.js
 */
const Router = require('koa-router');
const Publish = new Router();
const PublishController = require('../controller/publish');

Publish.post('/api/publish/create', PublishController.createPublish)
Publish.post('/api/publish/delete', PublishController.delPublish)

module.exports = Publish
