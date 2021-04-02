/*
 * @Author: your name
 * @Date: 2021-03-16 15:28:30
 * @LastEditTime: 2021-04-02 17:24:46
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\controller\comment.js
 */
const dbHelper = require('../db/dpHelper')
let Comment = dbHelper.getModel('comment')
const hints = require('../bin/hints')
const uuid = require('node-uuid')

class CommentController {
  /**
   * @description: 添加评论接口
   * @param {*} ctx
   * @return {*}
   */
  async pushComment(ctx) {
    let { aid, uid, content } = ctx.request.body

    if (!aid || !uid || !content) {
      return (ctx.body = hints.COMMENT_NO_FAIL)
    }

    let result = await Comment.updateOne(
      { aid: aid },
      {
        $addToSet: {
          comlist: {
            cid: uuid.v4(),
            uid,
            content,
            commenttime: new Date() * 1,
          },
        },
      }
    )

    if (result.nModified) {
      ctx.body = hints.SUCCESS({ msg: '评论成功！' })
    } else {
      ctx.body = hints.COMMENT_FAIL
    }
  }

  /**
   * @description: 删除评论
   * @param {*} ctx
   * @return {*}
   */
  async deleteComment(ctx) {
    let { aid, cid, uid } = ctx.request.body
    let result = await Comment.updateOne(
      { aid: aid },
      { $pull: { comlist: { cid: cid } } }
    )
    if (result.nModified) {
      ctx.body = hints.SUCCESS({ msg: '删除评论成功！' })
    } else {
      ctx.body = hints.COMMENT_DEL_FAIL
    }
  }
}

module.exports = new CommentController()
