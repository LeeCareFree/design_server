/*
 * @Author: your name
 * @Date: 2021-04-06 12:37:30
 * @LastEditTime: Fri Apr 09 2021 16:32:21
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\utils\monCommon.js
 */
const dbHelper = require('../db/dpHelper')
const User = dbHelper.getModel('user')
let Article = dbHelper.getModel('article')

let MongoUserAcountInfo = (uid) => {
  let userInfo = {}
  return User.findOne({
    uid: uid,
  })
    .then((res) => {
      Object.assign(userInfo, {
        uid: res.uid,
        username: res.username,
        nickname: res.nickname,
        avatar: res.avatar,
        gender: res.gender,
        bgimg: res.bgimg,
        introduction: res.introduction,
        city: res.city,
        proNum: res.proArr.length,
        likeNum: res.likeArr.length,
        collNum: res.collArr.length,
        fansNum: res.fansArr.length,
        followNum: res.followArr.length,
      })
      return Article.aggregate([
        {
          $match: {
            aid: { $in: res.proArr },
          },
        },
        {
          $project: {
            _id: 0,
            total: { $add: ['$like', '$coll'] },
          },
        },
      ])
    })
    .then((res) => {
      let sum = res.reduce((prev, cur) => {
        return prev + cur.total
      }, 0)
      return Object.assign(userInfo, {
        like_coll: sum,
      })
    })
}

/**
 * @description: 价格比较
 * @param {*} fee
 * @return {*}
 */
let compareDesignFee = (fee) => {
  let statement
  switch (fee) {
    case '不限':
    case undefined:
      statement = { $gt: 0 }
      break
    case '99元/㎡以下':
      statement = { $lt: 99 }
      break
    case '99元/㎡-199元/㎡':
      statement = { $gte: 99, $lt: 199 }
      break
    case '199元/㎡-299元/㎡':
      statement = { $gte: 199, $lt: 299 }
      break
    case '299元/㎡-399元/㎡':
      statement = { $gte: 199, $lt: 299 }
      break
    case '399元/㎡-499元/㎡':
      statement = { $gte: 199, $lt: 299 }
      break
    case '499元/㎡以上':
      statement = { $gte: 499 }
      break
    default:
      break
  }
  return statement
}

let sortStylist = () => {
  
}

module.exports = {
  MongoUserAcountInfo,
  compareDesignFee
}
