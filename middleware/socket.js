/*
 * @Author: your name
 * @Date: 2021-04-07 16:50:57
 * @LastEditTime: 2021-04-09 14:06:44
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design_server\middleware\socket.js
 */
const dbHelper = require('../db/dpHelper')
const Message = dbHelper.getModel('message')
const User = dbHelper.getModel('user')
const MessDetail = dbHelper.getModel('messdetail')
const { formDate } = require('../utils/utils')
const usocket = {},
  user = []

module.exports = (socket) => {
  //成员对象数组
  socket.on('createUser', async (uid) => {
    let message = await Message.findOne({ uid })
    if (!message) {
      Message.create({ uid })
    }
    // let uid = userInfo.uid
    if (!(uid in usocket)) {
      socket.uid = uid
      usocket[uid] = socket
      user.push(uid)
      socket.broadcast.emit('userEnter', uid, user.length - 1)
      console.log(user)
    }
  })

  socket.on('sendMessage', async (res) => {
    let { uid, guid, message } = res

    let sendUser = await User.findOne({ uid }, { nickname: 1, avatar: 1 })
    let getUser = await User.findOne({ uid: guid }, { nickname: 1, avatar: 1 })

    // console.log(sendUser, getUser)

    let sendItem = {
      uid: uid,
      nickname: sendUser.nickname,
      avatar: sendUser.avatar,
      message,
      time: new Date() * 1,
    }

    let getItem = {
      uid: guid,
      nickname: getUser.nickname,
      avatar: getUser.avatar,
      message,
      time: new Date() * 1,
    }

    // 给收信息方(g)的消息列表里添加发送方的信息
    Message.findOne({ uid: guid }).then((res) => {
      let list = res.messlist
      let i = list.findIndex((val) => val.uid === uid)
      if (i !== -1) {
        list.splice(i, 1)
        list.unshift(sendItem)
      } else {
        list.unshift(sendItem)
      }
      return Message.updateOne({ uid: guid }, { messlist: list })
    })
    // 给发送方(s)的消息列表里添加收信息方的信息
    Message.findOne({ uid }).then((res) => {
      let list = res.messlist
      let i = list.findIndex((val) => val.uid === guid)
      if (i !== -1) {
        list.splice(i, 1)
        list.unshift(getItem)
      } else {
        list.unshift(getItem)
      }
      return Message.updateOne({ uid }, { messlist: list })
    })

    await MessDetail.updateOne(
      {
        $or: [{ uid2: uid + '&' + guid }, { uid2: guid + '&' + uid }],
      },
      {
        uid2: uid + '&' + guid,
        $addToSet: {
          detaillist: sendItem,
        },
      },
      { upsert: true }
    )

    if (guid in usocket) {
      console.log('sendItem:', sendItem)
      usocket[guid].emit(
        'getMessage',
        Object.assign(sendItem, {
          time: formDate(sendItem.time),
        })
      )
    }
  })

  socket.on('messageList', async (uid) => {
    let result = await Message.findOne({ uid })

    let list = result.messlist
    list.forEach((item) => {
      Object.assign(item, {
        time: formDate(item.time),
      })
    })
    console.log('messagelist:', result)
    if(uid in usocket) {
      usocket[uid].emit('getMessageList', result)
    }
  })

  socket.on('messageDetail', (data) => {
    let { uid, guid } = data
    let result = MessDetail.findOne({ uid2: uid + '&' + guid || guid + '&' + uid })

    let list = result.detaillist
    list.forEach((item) => {
      Object.assign(item, {
        time: formDate(item.time),
      })
    })
    if(uid in usocket) {
      usocket[uid].emit('getMessageDetail', result)
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
