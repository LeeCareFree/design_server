const path = require('path')
const fs = require('fs')

/**
 * 上传文件保存到服务器
 */
// export async function CreateArtimgFs(file) {
//     const ext ='.'+file.type.split('/')[1]
//     const name = file.name.split('.')[0]
//     const imgName = `${name}_${new Date().getTime().toString()}${ext}`
//     const newpath =path.join(__dirname, '../public/artimg/'+imgName)
//     const reader = await fs.createReadStream(file.path) //创建可读流
//     const stream = await fs.createWriteStream(newpath) //创建一个可写流
//     await reader.pipe(stream)
//     return `${config.Imgurl}/artimg/${imgName}`
// }

/**
 * @description: 上传文件保存到服务器
 * @param {*} ctx
 * @param {*} files 传过来的文件列表
 * @param {*} dir 需要上传的文件夹
 * @return {*}
 */
function uploadFilePublic(ctx, files, dir = 'publish') {
  const flag = !!files.length // 是否是多个文件上传
  const filePath = path.join(__dirname, `../public/upload/${dir}`)
  const uploadUrl = `${ctx.origin}/upload/${dir}`
  let file, fileReader, fileResource, writeStream

  const fileFunc = function (file) {
    // 读取文件流
    fileReader = fs.createReadStream(file.path)
    // 组装成绝对路径
    fileResource = filePath + `/${file.name}`
    /*
       使用 createWriteStream 写入数据，然后使用管道流pipe拼接
      */
    writeStream = fs.createWriteStream(fileResource)
    fileReader.pipe(writeStream)
  }

  const returnFunc = function (flag) {
    if (flag) {
      let urlArr = []
      for (let i = 0; i < files.length; i++) {
        const f1 = files[i]
        fileFunc(f1)
        let url = `${uploadUrl}/${files[i].name}`
        urlArr.push(url)
      }
      return urlArr
    } else {
      fileFunc(files)
      return uploadUrl + `/${files.name}`
    }
  }

  // 判断文件夹是否存在，如果不在的话就创建一个
  if (!fs.existsSync(filePath)) {
    fs.mkdir(filePath, (err) => {
      if (err) {
        throw new Error(err)
      } else {
        return returnFunc(flag)
      }
    })
  } else {
    return returnFunc(flag)
  }
}

function deleteFilePublic(arr, dir = 'publish') {
  arr.forEach((element) => {
    const basename = path.basename(element)
    let filePath = path.join(__dirname, `../public/upload/${dir}/${basename}`)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  })
}

function formDate(date) {
  function formatTen(num) {
    return num > 9 ? num : '0' + num
  }

  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return year + '年' + formatTen(month) + '月' + formatTen(day) + '日 ' + `${hour}:${minute}:${second}`
}

module.exports = {
  uploadFilePublic,
  deleteFilePublic,
  formDate
}
