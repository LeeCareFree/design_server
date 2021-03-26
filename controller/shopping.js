/*
 * @Author: your name
 * @Date: 2021-03-25 16:55:20
 * @LastEditTime: 2021-03-25 17:01:30
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\controller\shopping.js
 */
const hints = require('../bin/hints')
const dbHelper = require('../db/dpHelper')
let Article = dbHelper.getModel('article')

class ShoppingController {
  getIcons(ctx) {
    
  }
}

module.exports = new ShoppingController();