/*
 * @Author: your name
 * @Date: Sat Apr 10 2021 13:39:30
 * @LastEditTime: 2021-04-15 14:02:24
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\routes\message.js
 */
const MessageController = require('../controller/message')
const Router = require('koa-router')
const Message = new Router()

Message.post('/api/message/getmessdetail', MessageController.getMessageDetail)
Message.post('/api/message/getsum', MessageController.getListSum)
Message.post('/api/message/messdetail/del', MessageController.deleteMessDetail)

module.exports = Message