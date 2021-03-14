/*
 * @Author: your name
 * @Date: 2020-10-30 17:13:51
 * @LastEditTime: 2021-03-10 19:16:15
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\db\models.js
 */
module.exports = {
	//用户表
	user: {
		uid: String,
		username: String,
		password: String,
		avatar: String
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
		username: String,
		avatar: String,
		imgList: Array, // 图片列表（图片）
		coverImg: String, // 封面（文章）
		spaceObj: Object, // 图文（文章用到）
		like: Number, // 喜欢
		coll: Number, // 收藏
		comments: Array,
		doorModel: String, // 户型 三室
		area: String, // 面积
		cost: String, // 花费
		location: String, // 地区
	}
};