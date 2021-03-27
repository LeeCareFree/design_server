/*
 * @Author: your name
 * @Date: 2021-03-24 13:47:20
 * @LastEditTime: 2021-03-25 16:04:03
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\controller\search.js
 */
const hints = require('../bin/hints')
const dbHelper = require('../db/dpHelper')
let Article = dbHelper.getModel('article')

class SearchController {
  constructor() {}

  async searchArticle(ctx) {
    let { query } = ctx.request.body
    console.log(ctx.request.body)
    if (!query) {
      return (ctx.body = hints.FINDFAIL({ msg: '搜索失败,搜索参数不能为空！' }))
    }

    let result = await Article.find(
      { title: { $regex: query } },
      { imgList: 1, title: 1, detail: 1, type: 1, aid: 1, cover: 1}
    )

    // console.log(result)
    ctx.body = hints.SUCCESS({
      data: result,
      msg: '搜索文章成功！'
    })
  }
}

module.exports = new SearchController()
