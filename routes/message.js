/*
 * @Author: your name
 * @Date: Sat Apr 10 2021 13:39:30
 * @LastEditTime: Sat Apr 10 2021 15:46:33
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\routes\message.js
 */
const MessageController = require('../controller/message')
const Router = require('koa-router')
const Message = new Router()

Message.post('/api/message/getmessdetail', MessageController.getMessageDetail)

module.exports = Message