/*
 * @Author: your name
 * @Date: 2021-04-07 16:50:57
 * @LastEditTime: 2021-04-08 14:07:15
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\middleware\socket.js
 */
var usocket = {},
  user = []

module.exports = (socket) => {
  //成员对象数组
  socket.on('new user', (username) => {
    // console.log(socket)
    if (!(username in usocket)) {
      socket.username = username
      usocket[username] = socket
      console.log(usocket)
      user.push(username)
      socket.emit('login', user)
      socket.broadcast.emit('user joined', username, user.length - 1)
      console.log(user)
    }
  })

  socket.on('send private message', function (res) {
    console.log(res)
    if (res.recipient in usocket) {
      usocket[res.recipient].emit('receive private message', res)
    }
  })

  socket.on('disconnect', function () {
    //移除
    if (socket.username in usocket) {
      delete usocket[socket.username]
      user.splice(user.indexOf(socket.username), 1)
    }
    console.log(user)
    socket.broadcast.emit('user left', socket.username)
  })
  // })
}
