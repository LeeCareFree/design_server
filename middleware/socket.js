/*
 * @Author: your name
 * @Date: 2021-04-07 16:50:57
 * @LastEditTime: Sat Apr 10 2021 17:50:54
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

let getMessageList = async (uid) => {
  let result = await Message.findOne({ uid })
  if (!result) return []
  let list = result.messlist
  list.forEach((item) => {
    Object.assign(item, {
      time: formDate(item.time),
    })
  })
  return list
}

/**
 * @description: 消息列表相关操作封装
 * @param {*} uid
 * @param {*} guid
 * @param {*} item 发送方对象 || 收信方对象
 * @return {*}
 */
let messageListFunc = async (uid, guid, item) => {
  await Message.findOne({ uid }).then((res) => {
    if (res) {
      let list = res.messlist
      // 如列表中存在该uid，将其提到首位
      let i = list.findIndex((val) => val.uid === guid)
      if (i !== -1) {
        list.splice(i, 1)
        list.unshift(item)
      } else {
        list.unshift(item)
      }
      return Message.updateOne({ uid }, { messlist: list })
    } else {
      return Message.create({ uid, messlist: [item] })
    }
  })
}

/**
 * @description: 消息详情列表相关操作封装
 * @param {*} uid
 * @param {*} guid
 * @param {*} item
 * @return {*}
 */
let messDetailFunc = async (uid, guid, item) => {
  let uid2 = uid + '&' + guid
  await MessDetail.findOne({ uid2 }).then((res) => {
    if (res) {
      return MessDetail.updateOne(
        { uid2 },
        {
          $addToSet: {
            detaillist: item,
          },
          $inc: { sum: 1 },
        }
      )
    } else {
      return MessDetail.create({
        uid2: uid + '&' + guid,
        detaillist: [item],
        sum: 1,
      })
    }
  })
}

let messNumAdd = async (guid, uid) => {
  await Message.findOne({ uid: guid }).then((res) => {
    let list = res.messlist
    list.map((item) => {
      if (item.uid === uid) {
        if (!item.messNum) {
          item.messNum = 1
        }
        item.messNum += 1
      }
    })
    return Message.updateOne({ uid: guid }, { detaillist: list })
  })
}

module.exports = (socket) => {
  //成员对象数组
  socket.on('createUser', (uid) => {
    // let uid = userInfo.uid
    if (!(uid in usocket)) {
      socket.uid = uid
      usocket[uid] = socket
      user.push(uid)
      socket.broadcast.emit('userEnter', uid, user.length - 1)
      console.log(user)
    }
  })

  // 该用户进入对话框，在该用户的socket里加入一个对方uid的属性
  socket.on('enterChat', async ({ uid, guid }) => {
    Object.assign(usocket[uid], {
      chatid: guid,
    })
    // 将当前接收方的消息列表中，和发送方的聊天的 messNum 给清零
    await Message.findOne({ uid: guid }).then((res) => {
      let getlist = res.messlist
      getlist.map((item) => {
        if (item.uid === uid) {
          item.messNum ? (item.messNum = 0) : ''
        }
      })
      return Message.updateOne({ uid: guid }, { detaillist: getlist })
    })
  })

  // 离开对话框
  socket.on('leaveChat', ({ uid }) => {
    if (usocket[uid].chatid) {
      delete usocket[uid].chatid
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
    // guid, uid
    messageListFunc(guid, uid, sendItem)
    // 给发送方(s)的消息列表里添加收信息方的信息
    // uid, guid
    messageListFunc(uid, guid, getItem)

    // 给对话框两位创建两个消息详情表
    messDetailFunc(uid, guid, sendItem)
    messDetailFunc(guid, uid, sendItem)

    if (guid in usocket) {
      console.log('sendItem:', sendItem)
      usocket[guid].emit(
        'getMessage',
        Object.assign(sendItem, {
          time: formDate(sendItem.time),
        })
      )
      let messagelist = getMessageList(guid)
      // 通知接收方更新列表
      usocket[guid].emit('getMessageList', messagelist)

      // 接收方在线，且不在对话框
      // usocket中的 chatid 中没有发送方的uid
      if (!usocket[guid].chatid || usocket[guid].chatid !== uid) {
        messNumAdd(guid, uid)
      }
    } else {
      // 接收方不在线
      messNumAdd(guid, uid)
    }
  })

  socket.on('messageList', async (uid) => {
    let messagelist = await getMessageList(uid)
    if (uid in usocket) {
      usocket[uid].emit('getMessageList', { messlist: messagelist })
    }
  })

  // socket.on('messageDetail', async (data) => {
  //   let { uid, guid } = data
  //   let result = await MessDetail.findOne({
  //     uid2: uid + '&' + guid || guid + '&' + uid,
  //   })

  //   let list = result.detaillist ? result.detaillist : []
  //   list.forEach((item) => {
  //     Object.assign(item, {
  //       time: formDate(item.time),
  //     })
  //   })
  //   console.log(uid)
  //   if (uid in usocket) {
  //     console.log(result)
  //     usocket[uid].emit('getMessageDetail', result)
  //   }
  // })

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
