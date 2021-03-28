/*
 * @Author: your name
 * @Date: 2020-10-30 17:13:51
 * @LastEditTime: 2021-03-28 16:04:20
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\db\models.js
 */
module.exports = {
	//用户表
	user: {
		uid: String,
		username: String,
		nickname: String,
		password: String,
		avatar: String,
		likeArr: {
			type: Array,
			default: []
		},
		collArr: {
			type: Array,
			default: []
		},
		articleArr: {
			type: Array,
			default: []
		},
		followArr: {
			type: Array,
			default: []
		},
		fansArr: {
			type: Array,
			default: []
		}
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
		uid: String
	},
	article: {
		type: String, // 1-文章，2-图片，3-视频
		aid: String,// 文章id
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
		createtime: String
	},
	comment: {
		aid: String,
		comlist: Array
	}
};