/*
 * @Author: your name
 * @Date: 2021-04-07 16:50:57
 * @LastEditTime: 2021-04-17 15:33:55
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
  let sum = 0
  if (result) {
    let list = result.messlist
    list.forEach((item) => {
      if (item.messNum) {
        sum += item.messNum
      }
      Object.assign(item, {
        time: formDate(item.time),
      })
    })
    return { list, sum }
  } else {
    return {
      list: [],
      sum,
    }
  }
}

/**
 * @description: 消息列表相关操作封装
 * @param {*} uid
 * @param {*} guid
 * @param {*} item 发送方对象 || 收信方对象
 * @return {*}
 */
let messageListFunc = async (uid, guid, item) => {
  let newItem = Object.assign({}, item)
  await Message.findOne({ uid }).then((res) => {
    if (res) {
      let list = res.messlist
      // 查看是否存在 messNum
      list.map((lis) => {
        if (lis.uid === guid) {
          if (lis.messNum) {
            Object.assign(newItem, { messNum: lis.messNum })
          }
        }
      })
      // 如列表中存在该uid，将其提到首位
      let i = list.findIndex((val) => val.uid === guid)
      if (i !== -1) {
        list.splice(i, 1)
        list.unshift(newItem)
      } else {
        list.unshift(newItem)
      }
      return Message.updateOne({ uid }, { messlist: list })
    } else {
      return Message.create({ uid, messlist: [newItem] })
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
        } else {
          item.messNum += 1
        }
      }
    })
    return Message.updateOne({ uid: guid }, { messlist: list })
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
    if (usocket[uid]) {
      Object.assign(usocket[uid], {
        chatid: guid,
      })
    }
    // 将当前接收方的消息列表中，和发送方的聊天的 messNum 给清零
    await Message.findOne({ uid })
      .then((res) => {
        if (!res) return
        let messlist = res.messlist
        let numProsime
        messlist.map((item) => {
          if (item.uid === guid && item.messNum) {
            item.messNum = 0
            numProsime = Promise.resolve(item.messNum)
          }
        })
        let updatePromise = Message.updateOne({ uid: uid }, { messlist })
        return Promise.all([numProsime, updatePromise])
      })
      .then(async (resArr) => {
        if (resArr && resArr[1].nModified) {
          let messRes = await getMessageList(uid)
          if (uid in usocket) {
            usocket[uid].emit('getMessageList', {
              messlist: messRes.list,
              sum: messRes.sum + resArr[0],
            })
          }
        }
      })
  })

  // 离开对话框
  socket.on('leaveChat', async ({ uid }) => {
    if (usocket[uid] && usocket[uid].chatid) {
      delete usocket[uid].chatid
    }
  })

  socket.on('sendMessage', async (res) => {
    let { uid, guid, message, time, endTime } = res

    let sendUser = await User.findOne({ uid }, { nickname: 1, avatar: 1 })
    let getUser = await User.findOne({ uid: guid }, { nickname: 1, avatar: 1 })

    // console.log(sendUser, getUser)

    let sendItem = {
      uid: uid,
      nickname: sendUser.nickname,
      avatar: sendUser.avatar,
      message,
      time,
    }

    let getItem = {
      uid: guid,
      nickname: getUser.nickname,
      avatar: getUser.avatar,
      message,
      time,
    }

    console.log(sendItem)

    // 给收信息方(g)的消息列表里添加发送方的信息
    // guid, uid
    await messageListFunc(guid, uid, sendItem)
    // 给发送方(s)的消息列表里添加收信息方的信息
    // uid, guid
    await messageListFunc(uid, guid, getItem)

    // 用于在聊天界面显示时间
    if (endTime) {
      Object.assign(sendItem, { endTime })
    }

    // 给对话框两位创建两个消息详情表
    await messDetailFunc(uid, guid, sendItem)
    await messDetailFunc(guid, uid, sendItem)

    if (guid in usocket) {
      // 接收方在线，且不在对话框
      // usocket中的 chatid 中没有发送方的uid
      if (!usocket[guid].chatid || usocket[guid].chatid !== uid) {
        await messNumAdd(guid, uid)
      }

      let messRes = await getMessageList(guid)
      // 通知接收方更新列表
      console.log(messRes)
      usocket[guid].emit('getMessageList', {
        messlist: messRes.list,
        sum: messRes.sum,
      })

      usocket[guid].emit('getMessageDetail', sendItem)
    } else {
      // 接收方不在线
      await messNumAdd(guid, uid)
    }
  })

  socket.on('messageList', async (uid) => {
    let messRes = await getMessageList(uid)
    if (uid in usocket) {
      usocket[uid].emit('getMessageList', {
        messlist: messRes.list,
        sum: messRes.sum,
      })
    }
  })

  // 实时删除当前聊天会话
  socket.on('deleteMess', async (data) => {
    let { uid, guid } = data
    await Message.updateOne(
      { uid },
      {
        $pull: { messlist: { uid: guid } },
      }
    )
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
