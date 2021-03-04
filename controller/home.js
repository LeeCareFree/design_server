const dbHelper = require("../db/dpHelper");
const Home = dbHelper.getModel("home");
const hints = require("../bin/hints");
const xss = require("node-xss").clean;

class HomeController {
  constructor() {

  }

  /**
   * 首页轮播图
   */
  async getSlideShow(ctx, next) {
    try {
      const result = await Home.find(null, {title: 1, imgList: 1, _id: 0}).sort({_id: -1}).limit(3)
      if(result) {
        ctx.body = hints.SUCCESS({
          data: result,
          msg: '获取轮播图数据成功！'
        })
      }
    } catch (err) {
      ctx.body = hints.FINDFAIL({
        data: err,
      });
      ctx.throw(err);
    }
  }

  /**
   * 创建文章
   */
  async createArticle(ctx) {
    try {
      let { 
        title, detail, imgList, doorModel, area, cost, location 
      } = xss(ctx.request.body)
      const result = await Home.create({
        title,
        detail,
        imgList: imgList || 'http://127.0.0.1:4000/indexImg/1.jpeg',
        doorModel,
        area,
        cost,
        location,
        like,
      })
    } catch (err) {
      ctx.body = hints.CREATEFAIL({
        data: err
      })
      ctx.throw(err);
    }
  }
}

module.exports = new HomeController();