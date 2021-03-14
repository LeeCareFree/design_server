const jwt = require("jsonwebtoken");
const Promise = require("bluebird");
const verify = Promise.promisify(jwt.verify);
const { secret } = require("../bin/config");
const hints = require("../bin/hints");

const xss = require("node-xss").clean;
/**
 * token Controller
 * Post checkToken
 */
class TokenController {
    constructor() {
        this.checkToken = this.checkToken.bind(this);
    }

    /**
     * 检查token
     * @param {*} ctx
     * @param {*} next
     */
    async checkToken(ctx, next) {
        try {
            const { token } = xss(ctx.request.body);
            console.log(token);
            if (token) {
                let payload;
                try {
                    payload = await verify(token.split(" ")[1], secret);
                    ctx.user = {
                        username: payload.username,
                        id: payload.id,
                    };
                } catch (err) {
                    if (err.name == "TokenExpiredError") {
                        //token过期
                        throw err = hints.TOKEN_EXPIRED;
                    } else if (err.name == "JsonWebTokenError") {
                        //无效的token
                        throw err = hints.TOKEN_INVALID;
                    }
                }
            } else {
                ctx.body = hints.FINDFAIL({msg:'未登录，请先登录！'});
            }
            await next();
        } catch (err) {
            ctx.body = err;
        }
    }
}

module.exports = new TokenController();