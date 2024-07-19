const middlewares = require("./index");

const checkFieldSecret = middlewares.checkExistFields(['secret'])
const checkFieldCode = middlewares.checkExistFields(['code'])

const checkFieldsAll = [checkFieldSecret, checkFieldCode]

module.exports.GET = [middlewares.checkCookies]
module.exports.POST = [middlewares.multer.any, checkFieldCode, middlewares.getCookies]
module.exports.PATCH = [middlewares.multer.any, ...checkFieldsAll, middlewares.getCookies]
module.exports.DELETE = [middlewares.getCookies]
