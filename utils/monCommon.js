/*
 * @Author: your name
 * @Date: 2021-04-06 12:37:30
 * @LastEditTime: 2021-04-06 12:52:03
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

module.exports = {
  MongoUserAcountInfo,
}
