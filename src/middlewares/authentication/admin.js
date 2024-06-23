const middlewares = require('../main')

const checkExistFields = (req, res, next) =>
    middlewares.checkExistFields(req, res, next, ['username', 'password'])

module.exports.POST = [middlewares.multer.any, checkExistFields]


