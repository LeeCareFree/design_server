/*
 * @Author: your name
 * @Date: 2020-11-13 11:53:35
 * @LastEditTime: 2020-11-13 15:30:16
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\utils\addToken.js
 */
const jwt = require("jsonwebtoken");
const { secret } = require("../bin/config");
const addToken = (userinfo) => {
  //创建token并导出
  const token = jwt.sign(
    {
      username: userinfo.username,
      id: userinfo.id,
    },
    secret,
    { expiresIn: "7d" }
  );
  return token;
};
module.exports = {
  addToken,
};
