/*
 * @Author: your name
 * @Date: 2020-10-30 18:36:11
 * @LastEditTime: 2020-11-13 17:32:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \blueSpace_server\middleware\conditionalParameters.js
 */
'use strict';


module.exports = function (app) {

  app.context.conditionalParams = function(...params) {
    // console.log(params)
    let obj = ['GET', 'HEAD'].includes(this.method.toUpperCase())
      ? JSON.parse(JSON.stringify(this.request.query))
      : this.request.body;
    let existParams = false;

    // Busca si existe la key value en el objeto enviado
    params.forEach(param => {
      if(obj.hasOwnProperty(param)){
        existParams = true;
      }  
    });

    if(existParams){
      return;
    }

    this.throw(422, 'Validation Failed', {
      code: 'CONDITIONAL_PARAM',
      error: params
    });

  };
  
  return async function conditionalParams(ctx, next) {
    
    try {
      await next();
    } catch(err){
      
      if (err.code === 'CONDITIONAL_PARAM') {
        ctx.status = 422;
        ctx.body = { 
          code        : 422,
          message     : err.message,
          data        : {
            code: err.code,
            error: err.error,
          }
        }
        return;
      }

      throw err;
    }
  };
};