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
  socket.on('createUser', (uid) => {
    if (!(uid in usocket)) {
      socket.uid = uid
      usocket[uid] = socket
      user.push(uid)
      socket.broadcast.emit('userEnter', uid, user.length - 1)
    }
  })

  socket.on('sendMessage', (res) => {
    // usocket[res.uid].emit('getMessage', res)
    if (res.guid in usocket) {
      usocket[res.guid].emit('getMessage', res)
    }
  })

  socket.on('disconnect', function () {
    //移除
    if (socket.uid in usocket) {
      delete usocket[socket.uid]
      user.splice(user.indexOf(socket.uid), 1)
    }
    socket.broadcast.emit('userLeft', socket.uid)
  })
  // })
}
