/*
 * @Author: your name
 * @Date: 2021-03-16 15:24:33
 * @LastEditTime: 2021-03-16 20:33:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\routes\comment.js
 */
const Router = require('koa-router');
const Comment = new Router();
const CommentController = require('../controller/comment');

Comment.post('/api/comments/push', CommentController.pushComment)
Comment.post('/api/comments/delete', CommentController.deleteComment)

module.exports = Comment
