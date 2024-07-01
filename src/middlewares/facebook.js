const middlewares = require("./index");

const checkAccessToken = (req, res, next) => middlewares.checkExistFields(req, res, next, ['access_token'])

module.exports.PATCH = [middlewares.multer.any, middlewares.checkCookies, checkAccessToken]
module.exports.POST = [middlewares.multer.any]
