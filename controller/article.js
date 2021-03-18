/*
 * @Author: your name
 * @Date: 2021-03-10 14:46:27
 * @LastEditTime: 2021-03-17 15:46:02
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\controller\article.js
 */
const dbHelper = require('../db/dpHelper')
let Article = dbHelper.getModel('article')
let Comment = dbHelper.getModel('comment')
const uuid = require('node-uuid')
const hints = require('../bin/hints')

const { uploadFilePublic, deleteFilePublic, formDate } = require('../utils/utils')
const User = require('../routes/users')

class ArticleController {
  /**
   * 创建发布
   */
  async createArticle(ctx) {
    try {
      console.log(ctx.request.files['files[]'])
      const files = ctx.request.files['files[]']
      let url, result
      let {
        type,
        uid,
        title,
        detail,
        like = 0,
        coll = 0,
        doorModel,
        area,
        cost,
        location,
      } = ctx.request.body

      if (!type || !uid || !title || !detail) {
        return (ctx.body = hints.CREATEFAIL({
          data: '必传值未传',
        }))
      }

      url = uploadFilePublic(ctx, files)

      let aid = uuid.v4()
      let newValue = {
        type, // 1-文章，2-图片，3-视频
        aid,
        uid,
        title,
        detail,
        imgList: url, // 图片列表（图片）
        like, // 喜欢
        coll, // 收藏
        createtime: formDate(new Date())
      }
      // 创建文章形式
      if (type === '1') {
        newValue = Object.assign(newValue, {
          doorModel,
          area,
          cost,
          location,
        })
        result = await Article.create(newValue)
      } else if (type === '2') {
        // 图片形式
        result = await Article.create(newValue)
      }

      if (result) {
        ctx.body = hints.SUCCESS({
          data: newValue,
          msg: '发布成功',
        })
        // 评论表
        await Comment.create({
          aid,
          cid: uuid.v4(),
          comlist: [],
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  async delArticle(ctx) {
    let imgList
    let { aid } = ctx.request.body

    let article = await Article.findOne({ aid: aid })
    if (article) {
      imgList = article.imgList
      // 删除评论文档
      await Comment.remove({ aid: aid })
    } else {
      return (ctx.body = hints.ARTICLE_NOT_EXIST)
    }

    deleteFilePublic(imgList)

    let result = await Article.deleteOne({ aid: aid })
    if (result) {
      ctx.body = hints.SUCCESS({ msg: '删除文章成功' })
    }
  }

  async queryArticle(ctx) {
    let { aid } = ctx.request.body
    let articleResult = await Article.aggregate([
      {
        $match: { aid: aid },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'uid',
          foreignField: 'uid',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          __v: 0,
          uid: 0,
          'user._id': 0,
          'user.__v': 0,
          'user.password': 0,
          'user.password': 0,
          'user.likeArr': 0,
          'user.articleArr': 0,
          'user.followArr': 0,
          'user.fansArr': 0,
          'user.collArr': 0,
          'comments._id': 0,
        },
      },
    ])

    // 查评论表
    let commentResult = await Comment.aggregate([
      {
        $match: { aid: aid },
      },
      {
        $unwind: '$comlist',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'comlist.uid',
          foreignField: 'uid',
          as: 'comlist.user',
        },
      },
      { $unwind: '$comlist.user' },
      {
        $group: {
          _id: '$_id',
          comlist: { $push: '$comlist' },
        },
      },
      {
        $project: {
          _id: 0,
          'comlist.user._id': 0,
          'comlist.user.password': 0,
          'comlist.user.__v': 0,
          'comlist.user.password': 0,
          'comlist.user.likeArr': 0,
          'comlist.user.collArr': 0,
          'comlist.user.articleArr': 0,
          'comlist.user.followArr': 0,
          'comlist.user.fansArr': 0,
        },
      },
    ])

    if (articleResult.length) {
      let article = articleResult[0]
      let comments = commentResult.length
        ? commentResult[0].comlist
        : commentResult
      // 将查询的评论表添加入文章中
      article['comments'] = comments
      ctx.body = hints.SUCCESS({ data: article, msg: '文章查询成功！' })
    } else {
      return (ctx.body = hints.ARTICLE_NOT_EXIST)
    }
  }

  async getArticleList(ctx) {
    let result = await Article.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'uid',
          foreignField: 'uid',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          __v: 0,
          uid: 0,
          'user._id': 0,
          'user.__v': 0,
          'user.password': 0,
          'user.likeArr': 0,
          'user.collArr': 0,
          'user.articleArr': 0,
          'user.followArr': 0,
          'user.fansArr': 0,
        },
      },
    ])
    if (result) {
      ctx.body = hints.SUCCESS({
        data: result,
        msg: '获取文章列表成功',
      })
    } else {
      ctx.body = hints.FINDFAIL()
    }

    // console.log(result)
  }
}

module.exports = new ArticleController()
