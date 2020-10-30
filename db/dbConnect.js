/*
 * @Author: your name
 * @Date: 2020-10-09 11:26:39
 * @LastEditTime: 2020-10-30 17:56:54
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
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('db success');
});