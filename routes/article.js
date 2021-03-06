/*
 * @Author: your name
 * @Date: 2021-03-10 14:44:42
 * @LastEditTime: 2021-03-30 18:02:07
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\routes\publish.js
 */
const Router = require('koa-router');
const Article = new Router();
const ArticleController = require('../controller/article');

Article.post('/api/articles/create', ArticleController.createArticle)
Article.post('/api/articles/delete', ArticleController.delArticle)
Article.post('/api/articles/query',ArticleController.queryArticle)
Article.post('/api/articles/getlist', ArticleController.getArticleList)

module.exports = Article
