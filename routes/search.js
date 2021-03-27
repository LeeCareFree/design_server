/*
 * @Author: your name
 * @Date: 2021-03-24 13:45:50
 * @LastEditTime: 2021-03-25 12:38:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\routes\search.js
 */
const Router = require('koa-router');
const Search = new Router();
const SearchController = require('../controller/search');

Search.post('/api/search/article', SearchController.searchArticle)

module.exports = Search