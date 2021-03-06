/*
 * @Author: your name
 * @Date: 2020-10-30 17:13:51
 * @LastEditTime: Sat Apr 10 2021 14:43:39
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\db\models.js
 */
module.exports = {
  admin: {
    username: String,
    password: String,
  },
  //用户表
  user: {
    uid: String,
    username: String,
    nickname: String,
    password: String,
    avatar: String,
    gender: Number,
    introduction: String, // 介绍
    city: String, // 所在城市， 服务地区
    bgimg: String, // 默认背景图
    identity: {
      type: String,
      default: 'user',
    }, // 身份: user、stylist、decoCompany
    likeArr: {
      type: Array,
      default: [],
    },
    collArr: {
      type: Array,
      default: [],
    },
    proArr: {
      type: Array,
      default: [],
    },
    followArr: {
      type: Array,
      default: [],
    },
    fansArr: {
      type: Array,
      default: [],
    },
  },
  // 发布作品
  home: {
    title: String,
    detail: String,
    imgList: Array, // 图片列表
    like: Number, // 喜欢
    coll: Number, // 收藏
    doorModel: String, // 户型 三室
    area: Number, // 面积
    cost: String, // 花费
    location: String, // 地区
    uid: String,
  },
  article: {
    type: String, // 1-文章，2-图片，3-视频
    aid: String, // 文章id
    uid: String,
    title: String,
    detail: String,
    desc: Array, // 装修文章的房间描述
    imgList: Array, // 图片列表（图片）
    cover: String, // 封面（文章）
    spaceObj: Object, // 图文（文章用到）
    like: Number, // 喜欢
    coll: Number, // 收藏
    doorModel: String, // 户型 三室
    area: String, // 面积
    cost: String, // 花费
    location: String, // 地区
    duplex: String,
    decoratestyle: String,
    decorateduration: String,
    decorateother: String,
    videoUrl: String, // 视频连接
    createtime: Number,
  },
  comment: {
    aid: String,
    comlist: Array,
  },
  userinfo: {
    uid: String,
    city: String,
    progress: String, // 装修进度
    doorModel: String, // 户型
    area: String, // 面积
    populace: String, // 人口
    cost: String, // 预算
    beginTime: String, //开始装修时间
    checkInTime: String, // 入住时间
  },
  decorateinfo: {
    uid: String,
    city: String, // 服务地区
    address: String, // 详细地址
    stylearr: Array, // 风格
    designfee: Number, // 费用
    phone: String, // 联系方式
    service: Array, // 服务介绍
  },
  message: {
    uid: String,
    messlist: Array,
  },
  messdetail: {
    uid2: String,
    detaillist: Array,
    sum: Number,
  },
}
