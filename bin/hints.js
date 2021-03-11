/*
 * @Author: your name
 * @Date: 2020-10-30 16:45:24
 * @LastEditTime: 2021-03-11 11:13:53
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\bin\hints.js
 */

const statusCode = {
    SUCCESSCODE : 200,
    EXIST       : 304,
    ERROR       : 500, 
    NOT_FOUND: 404,
    LOGINFAIL   : 401,
    PUBLISHFAIL : 506
 };

const hints = {
    ERROR : {msg : '服务异常！',code: statusCode.ERROR, },
    NOT_FOUND: {msg: "404", code: statusCode.NOT_FOUND},
    REGISTER_UNAVAILABLE: { msg: "该用户名已被占用！" , code: statusCode.EXIST},
    SUCCESS({data = "", msg}) {
      return { data, msg: msg, code : statusCode.SUCCESSCODE};
    },
    LOGIN_PASSWORD_WRONG: { msg: "密码错误！" ,code: statusCode.LOGINFAIL, },
    LOGIN_USER_NOT_EXIST: { msg: "用户不存在！", code: statusCode.LOGINFAIL },
    CREATEFAIL({data = {}}) {
      return {data, msg: '创建失败！', code: statusCode.ERROR}
    },
    FINDFAIL({data = {}}) {
      return {data, msg: '查询失败！', code: statusCode.ERROR};
    },
    TOKEN_EXPIRED: {msg: "token过期，请重新登录！", code: statusCode.LOGINFAIL},
    TOKEN_INVALID: {msg: "token无效，请重新登录！", code: statusCode.LOGINFAIL},
    PUBLISH_NOT_EXIST: {msg: "发布不存在!", code: statusCode.PUBLISHFAIL}
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