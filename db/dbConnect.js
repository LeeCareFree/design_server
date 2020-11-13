/*
 * @Author: your name
 * @Date: 2020-10-09 11:26:39
 * @LastEditTime: 2020-11-13 18:05:10
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\db\dbConnect.js
 */
const mongoose = require('mongoose')
const config = require('../bin/config')

mongoose.connect(config.db.mongodb, { useNewUrlParser: true, useUnifiedTopology: true },(err)=>{
    if(err){
        console.log("mongodb数据库连接失败！")
    }else{
        console.log("mongodb数据库连接成功！")
    }
});
module.exports = mongoose.connection;