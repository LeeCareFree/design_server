/*
 * @Author: your name
 * @Date: 2021-03-25 16:55:20
 * @LastEditTime: 2021-04-02 13:00:54
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\controller\shopping.js
 */
const hints = require('../bin/hints')
const dbHelper = require('../db/dpHelper')
const xss = require('node-xss').clean
let Article = dbHelper.getModel('article')

class StylistController {
  constructor() {
  }


}

module.exports = new StylistController();