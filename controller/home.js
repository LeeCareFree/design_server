/*
 * @Author: your name
 * @Date: 2021-01-06 11:48:27
 * @LastEditTime: 2021-04-05 15:11:04
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\controller\home.js
 */
const dbHelper = require('../db/dpHelper')
const Article = dbHelper.getModel('article')
const hints = require('../bin/hints')
const xss = require('node-xss').clean

class HomeController {
  constructor() {}

  /**
   * 首页轮播图
   */
  async getSlideShow(ctx, next) {
    try {
      const result = await Article.find(null, {
        title: 1,
        imgList: 1,
        cover: 1,
        aid: 1,
        type: 1,
        _id: 1
      })
        .limit(3)
        .then((res) => {
          let reValue = []
          res.forEach((item) => {
            reValue.push({
              img: item.type === '2' ? item.imgList[0] : item.cover,
              title: item.title,
              aid: item.aid,
              type: item.type
            })
          })
          return reValue
        })
      if (result) {
        ctx.body = hints.SUCCESS({
          data: result,
          msg: '获取轮播图数据成功！',
        })
      }
    } catch (err) {
      ctx.body = hints.FINDFAIL({
        data: err,
      })
      ctx.throw(err)
    }
  }
}

module.exports = new HomeController()
