/*
 * @Author: your name
 * @Date: 2020-10-30 17:13:51
 * @LastEditTime: 2020-11-13 15:46:13
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\db\models.js
 */
module.exports = {
	//用户表
	user : {
		uid: String,
		username : String,
		password : String,
		avatar: String
	},
	// 首页
	home : {
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
	}
};