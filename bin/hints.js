/*
 * @Author: your name
 * @Date: 2020-10-30 16:45:24
 * @LastEditTime: 2021-03-17 17:10:08
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\bin\hints.js
 */

const statusCode = {
  SUCCESSCODE: 200,
  EXIST: 304,
  ERROR: 500,
  NOT_FOUND: 404,
  LOGINFAIL: 401,
  PARAM_ERROR: 410,
  ALREADY_ERROR: 409,
  ARTICLE_FAIL: 506,
  COMMENT_FAIL: 507
};

const hints = {
  ERROR: { msg: '服务异常！', code: statusCode.ERROR, },
  NOT_FOUND: { msg: "404", code: statusCode.NOT_FOUND },
  REGISTER_UNAVAILABLE: { msg: "该用户名已被占用！", code: statusCode.EXIST },
  SUCCESS({ data = "", msg }) {
    return { data, msg: msg, code: statusCode.SUCCESSCODE };
  },
  LOGIN_PASSWORD_WRONG: { msg: "密码错误！", code: statusCode.LOGINFAIL, },
  LOGIN_USER_NOT_EXIST: { msg: "用户不存在！", code: statusCode.LOGINFAIL },
  CREATEFAIL({ data = {} }) {
    return { data, msg: '创建失败！', code: statusCode.ERROR }
  },
  FINDFAIL(data) {
    return { msg: data.msg || '失败！', code: data.code || statusCode.ERROR };
  },
  TOKEN_EXPIRED: { msg: "token过期，请重新登录！", code: statusCode.LOGINFAIL },
  TOKEN_INVALID: { msg: "token无效，请重新登录！", code: statusCode.LOGINFAIL },
  TOKEN_NOEXIST: { msg: "token不存在，请登录！", code: statusCode.LOGINFAIL },
  ARTICLE_NOT_EXIST: { msg: "文章不存在!", code: statusCode.ARTICLE_FAIL },
  COMMENT_FAIL: {msg: "评论失败！", code: statusCode.COMMENT_FAIL},
  COMMENT_DEL_FAIL: {msg: "删除评论失败！不存在这条评论或已删除", code: statusCode.COMMENT_FAIL},
  COMMENT_NO_FAIL: {msg: "aid,uid或content参数未传", code: statusCode.COMMENT_FAIL},
  PARAM_ERROR: {msg: "必传参数未传！", code: statusCode.PARAM_ERROR},
  FRONT_ALREADY({ msg }) {
    return {msg: msg || "已操作!", code: statusCode.ALREADY_ERROR}
  }
  // SUBSCRIBED_ALREADY: { data: "已经关注过了", msg: ERROR },
  // ADDSUB_SUCCESS: { data: "添加关注成功", msg: SUCCESS },
  // NOT_SUBSCRIBED: { data: "没有关注", msg: ERROR },
  // UNSUBSCRIBE_SUCCESS: { data: "取消关注成功", msg: SUCCESS },
  // COMMENT_SUCCESS: { data: "评论成功", msg: SUCCESS },
  // QUESTION_UNEXIST: { data: "问题不存在", msg: ERROR },
  // COMMENT_NOT_EXIST: { data: "评论不存在", msg: ERROR },
  // THUMB_ALREADY: { data: "已经点过赞了", msg: ERROR },
  // THUMB_SUCCESS: { data: "点赞成功", msg: SUCCESS }
};

module.exports = hints;