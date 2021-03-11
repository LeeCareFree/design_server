/*
 * @Author: your name
 * @Date: 2021-03-10 14:46:27
 * @LastEditTime: 2021-03-11 11:30:47
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\controller\publish.js
 */
const dbHelper = require("../db/dpHelper");
let Publish = dbHelper.getModel("publish");
const uuid = require('node-uuid');
const hints = require("../bin/hints");

const { uploadFilePublic, deleteFilePublic } = require('../utils/utils')

class PublishController {
  /**
   * 创建发布
   */
  async createPublish(ctx) {
    try {
      const files = ctx.request.files.file
      let url, result
      let { 
        type, uid, title, detail, 
        like = 0, coll = 0, doorModel, area, cost, location 
      } = ctx.request.body
      
      url = uploadFilePublic(ctx, files)
      
      let pid = uuid.v4()
      let newValue = {
        type, // 1-文章，2-图片，3-视频
        pid,
        uid,
        title,
        detail,
        imgList: url, // 图片列表（图片）
        like, // 喜欢
        coll, // 收藏
      }
      // 创建文章形式
      if(type === '1') {
        newValue = Object.assign(newValue, {
          doorModel, area, cost,  location
        })
        result = await Publish.create(newValue)
      } else if(type === '2') { // 图片形式
        result = await Publish.create(newValue)
      }
      
      if(result) {
        ctx.body = hints.SUCCESS({
          data: newValue,
          msg: "发布成功",
        })
      }

    } catch (error) {
      console.log(error)
    }
  }

  async delPublish(ctx) {
    let imgList
    let { pid } = ctx.request.body
    let publish = await Publish.findOne({pid: pid})
    if(publish) {
      imgList = publish.imgList
    } else {
      return ctx.body = hints.PUBLISH_NOT_EXIST
    }

    deleteFilePublic(imgList)
    
    let result = await Publish.deleteOne({pid: pid})
    if(result) {
      ctx.body = hints.SUCCESS({msg: '删除作品成功'})
    }
  }
}

module.exports = new PublishController();
