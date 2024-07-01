const middlewares = require("./index");


const checkFieldSecret = (req, res, next) =>
    middlewares.checkExistFields(req, res, next, ['secret'])

const checkFieldCode = (req, res, next) =>
    middlewares.checkExistFields(req, res, next, ['code'])


const checkFieldsAll = [checkFieldSecret, checkFieldCode]

module.exports.GET = [middlewares.checkCookies]

module.exports.POST = [middlewares.multer.any, middlewares.checkCookies, checkFieldCode]

module.exports.PATCH = [middlewares.multer.any, middlewares.checkCookies, ...checkFieldsAll]
