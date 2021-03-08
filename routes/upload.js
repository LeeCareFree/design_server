const Router = require('koa-router');
const Upload = new Router();
var fs = require('fs');
const path = require('path');
const hints = require("../bin/hints");
const {localPath} = require('../bin/config')

// 上传图片-作品
Upload.post('/upload/postpublish', ctx => {
  const files = ctx.request.files.file
  if (files.length === undefined) {
    // 上传单个文件，它不是数组，只是单个的对象
    uploadFilePublic(ctx, files, false)
  } else {
    uploadFilePublic(ctx, files, true)
  }
})

// 删除图片-单
Upload.delete('/upload/delpublish', ctx => {
  console.log(ctx.request.body)
  let { url } = ctx.request.body
  const basename = path.basename(url)
  let filePath = path.resolve(`${localPath}\\design_server\\public\\upload\\publish\\${basename}`)
  if(fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    ctx.body = {
      msg: '删除图片成功',
      code: 200
    }
  } else {
    ctx.body = {
      msg: '图片不存在'
    }
  }
  
})

Upload.get('/upload/getpublish', ctx => {
  let filePath = path.resolve(`${localPath}\\design_server\\public\\upload\\publish`);
  let urlPath = `${ctx.origin}/upload/publish`
  console.log('filePath:',filePath)
  //调用文件遍历方法
  let List = fileDisplay(filePath, urlPath)
  ctx.body = hints.SUCCESS({
    data: List,
    msg: '获取图片列表成功！'
  })
})

/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */
function fileDisplay(filePath, urlPath){
  //根据文件路径读取文件，返回文件列表
  let List = fs.readdirSync(filePath);
  List.forEach((element, i) => {
    List[i] = `${urlPath}/${element}`
  });
  return List
}

/*
 flag: 是否是多个文件上传
*/
const uploadFilePublic = function(ctx, files, flag) {
  const filePath = path.join(__dirname, '../public/upload/publish');
  const uploadUrl = `${ctx.origin}/upload/publish`;
  let file,
    fileReader,
    fileResource,
    writeStream;

  const fileFunc = function(file) {
    // 读取文件流
    fileReader = fs.createReadStream(file.path);
    // 组装成绝对路径
    fileResource = filePath + `/${file.name}`;
    /*
     使用 createWriteStream 写入数据，然后使用管道流pipe拼接
    */
    writeStream = fs.createWriteStream(fileResource);
    fileReader.pipe(writeStream);
  };

  const returnFunc = function(flag) {
    if (flag) {
      let url = '';
      for (let i = 0; i < files.length; i++) {
        url += uploadUrl + `/${files[i].name},`
      }
      url = url.replace(/,$/gi, "");
      ctx.body = {
        url: url,
        code: 200,
        message: '上传成功'
      };
    } else {
      ctx.body = {
        url: uploadUrl + `/${files.name}`,
        code: 200,
        message: '上传成功'
      };
    }
  };

  if (flag) {
    // 多个文件上传
    for (let i = 0; i < files.length; i++) {
      const f1 = files[i];
      fileFunc(f1);
    }
  } else {
    fileFunc(files);
  }
  
  // 判断文件夹是否存在，如果不在的话就创建一个
  if (!fs.existsSync(filePath)) {
    fs.mkdir(filePath, (err) => {
      if (err) {
        throw new Error(err);
      } else {
        returnFunc(flag);
      }
    });
  } else {
    returnFunc(flag);
  }
}

module.exports = Upload