const middlewares = require("./index");

const checkAccessToken = middlewares.checkExistFields(['access_token'])

module.exports.PATCH = [middlewares.multer.any, checkAccessToken, middlewares.getCookies]
module.exports.POST = [middlewares.multer.any]
module.exports.DELETE = [middlewares.getCookies]
