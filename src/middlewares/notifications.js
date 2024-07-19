const middlewares = require("./index");
const { Main} = require("../database/collections/notification")

const getCookies = middlewares.getCookies

module.exports.GET = [...getCookies]
module.exports.DELETE = [...getCookies, ...middlewares.getData(Main)]
module.exports.CLEAR = [...getCookies]

