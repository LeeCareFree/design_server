/*
 * @Author: your name
 * @Date: Sat Apr 10 2021 13:39:13
 * @LastEditTime: 2021-04-15 14:09:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\controller\message.js
 */
const hints = require('../bin/hints')
const dbHelper = require('../db/dpHelper')
const MessDetail = dbHelper.getModel('messdetail')

class MessageController {
  async getMessageDetail(ctx, next) {
    try {
      let { page, size, uid, guid, sum } = ctx.request.body
      let uid2 = uid + '&' + guid
      let result = await MessDetail.findOne({ uid2 }).then((res) => {
        if (!res) return res

        let detaillist,
          list = res.detaillist
        let skip = Number(sum) - Number(size) * Number(page)
        let end = Number(sum) - Number(size) * Number(page - 1)
        console.log(skip, end)
        if (skip < 0 && end > 0) {
          detaillist = list.slice(0, end)
        } else if (skip < 0 && end < 0) {
          skip = end = 0
          detaillist = []
        } else {
          detaillist = list.slice(skip, end)
        }
        console.log(detaillist)
        return Object.assign(res, {
          detaillist,
        })
      })
      console.log('result:', result)
      if (result) {
        ctx.body = hints.SUCCESS({
          data: result,
          msg: '获取聊天详情成功！',
        })
      } else {
        ctx.body = hints.FINDFAIL({ msg: '查询失败' })
      }
    } catch (err) {
      next()
    }
  }

  async getListSum(ctx) {
    let { uid, guid } = ctx.request.body
    let uid2 = uid + '&' + guid
    let result = await MessDetail.findOne({ uid2 }, { sum: 1, _id: 0 })
    if (result) {
      ctx.body = hints.SUCCESS({
        data: result,
        msg: '获取消息列表总数成功！',
      })
    } else {
      ctx.body = hints.SUCCESS({
        data: {
          sum: 0,
        },
        msg: '获取消息列表总数成功！',
      })
    }
  }

  /**
   * @description: 删除详情列表的聊天记录
   * @param {*} ctx
   * @return {*}
   */  
  async deleteMessDetail(ctx) {
    // way => all 、 single
    let { uid, guid, index, way } = ctx.request.body
    let uid2 = uid + '&' + guid
    // let len = index.length
    let result
    if (way === 'all') {
      result = await MessDetail.deleteOne({ uid2 })
    } else {
      result = await MessDetail.findOne({ uid2 }).then((res) => {
        let detailList = res.detaillist
        detailList.splice(index, 1)
        return MessDetail.updateOne(
          { uid2 },
          {
            detaillist: detailList,
            $inc: { sum: -1 },
          }
        )
      })
    }

    // console.log(result)
    if (result.nModified || result.deletedCount) {
      ctx.body = hints.SUCCESS({
        msg: '删除成功！'
      })
    } else {
      ctx.body = hints.UPDATE({
        msg: '删除失败！'
      })
    }
  }
}

module.exports = new MessageController()
