/*
 * @Author: your name
 * @Date: 2021-03-25 16:55:20
 * @LastEditTime: Sat Apr 10 2021 16:21:25
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\controller\shopping.js
 */
const hints = require('../bin/hints')
const dbHelper = require('../db/dpHelper')
const Article = dbHelper.getModel('article')
let DecoInfo = dbHelper.getModel('decorateinfo')
let User = dbHelper.getModel('user')
let { compareDesignFee } = require('../utils/monCommon')

class StylistController {
  constructor() {}

  async getStylistList(ctx) {
    let { page = 1, size = 10, designfee, stylearr, service } = ctx.request.body
    console.log(designfee)

    let result = await User.aggregate([
      {
        $lookup: {
          from: 'decorateinfos',
          localField: 'uid',
          foreignField: 'uid',
          as: 'detailInfo',
        },
      },
      { $unwind: '$detailInfo' },
      {
        $match: {
          $and: [
            { identity: 'stylist' },
            { 'detailInfo.designfee': compareDesignFee(designfee) },
            {
              'detailInfo.stylearr': stylearr
                ? { $all: stylearr }
                : { $regex: /.*/ },
            },
            { 'detailInfo.service': service ? {} : {$regex: /.*/} },
          ],
        },
      },
      {
        $skip: Number(page - 1) * Number(size),
      },
      {
        $limit: Number(size),
      },
      {
        $project: {
          _id: 0,
          likeArr: 0,
          collArr: 0,
          followArr: 0,
          fansArr: 0,
          password: 0,
          'detailInfo._id': 0,
          'detailInfo.uid': 0,
        },
      },
    ])
      .then((listRes) => {
        let promiseArr = listRes.map((item) => {
          return Article.find({
            type: { $in: ['1', '2'] },
            aid: { $in: item.proArr.slice(0, 3) },
          })
        })
        var promise1 = Promise.resolve(listRes)
        return Promise.all([promise1, ...promiseArr])
      })
      .then((resArr) => {
        // 0设计师的数组对象
        // 1以后传的是查询每个设计师里作品的数组
        let stylistList = resArr[0]
        let prodList = resArr.slice(1, resArr.length)
        let stylists = stylistList.map((item, index) => {
          let prodImgList = []
          // 遍历作品数组，将图片放入设计师数组对象中
          prodList[index].map((pro) => {
            let img
            if (pro.type === '1') {
              img = pro.cover
            } else {
              img = pro.imgList[0]
            }
            prodImgList.push(img)
          })
          return Object.assign(item, {
            prodImgList,
          })
        })
        return stylists
      })
    if (result) {
      ctx.body = hints.SUCCESS({
        data: {
          result,
        },
        msg: '获取列表成功',
      })
    } else {
      ctx.body = hints.FINDFAIL({msg: '获取失败'})
    }
  }
}

module.exports = new StylistController()
