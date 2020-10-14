/**
 * @description res的数据模型
 */

/**
 * 基础模块
 */
class BaseModel {
    constructor({ code, data, msg }) {
        this.code = code;
        if (data) {
            this.data = data;
        }
        if (msg) {
            this.msg = msg;
        }
    }
}

/**
 * 成功的数据模型
 */
class SuccessModel extends BaseModel {
    constructor(data = {}, msg) {
        super({ code: 0, data, msg: msg || 'success' });
    }
}

/**
 * 失败的数据模型
 */
class ErrorModel extends BaseModel {
    constructor({ code, msg }) {
        super({ code, msg: msg || 'error'});
    }
}

module.exports = { SuccessModel, ErrorModel }