const Router = require('koa-router');
const Upload = new Router();
var fs = require('fs');
const path = require('path');
const hints = require("../bin/hints");
const { localPath } = require('../bin/config')
const { uploadFilePublic } = require('../utils/utils')

// 上传图片-作品
Upload.post('/upload/postpublish', ctx => {
  const files = ctx.request.files.file
  let url = uploadFilePublic(ctx, files, 'publish')

  ctx.body = {
    url,
    code: 200,
    message: '上传成功'
  };
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


module.exports = Upload