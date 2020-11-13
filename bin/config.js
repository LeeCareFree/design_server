/*
 * @Author: your name
 * @Date: 2020-10-09 11:26:39
 * @LastEditTime: 2020-11-13 17:37:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\bin\config.js
 */
module.exports = {
    db: {
        mongodb:'mongodb://localhost/bluespace',
    },
    secret: 'lee',
    port: process.env.port || '3000',
}