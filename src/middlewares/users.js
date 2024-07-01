const response = require('../constants/response')
const middlewares = require('./index')

const User = require('../database/collections/users')

const getData = middlewares.getData(User)
const getCookies = middlewares.getCookies(User)

const checkExistFields = (req, res, next) =>
middlewares.checkExistFields(req, res, next, ['username', 'password', 'fullname'])


const alreadyHaveUserName = async (req, res, next) =>
{
    const filter = { username } = req.body
    const found = await  User.find(filter)
    next(found.length ? response.ERROR.EXISTS({ username }) : null)
}


module.exports.GET = [...getData]
module.exports.POST = [middlewares.multer.image('avatar'), checkExistFields, alreadyHaveUserName]
module.exports.PATCH = [middlewares.multer.image('avatar'), ...getData]
module.exports.PROFILE = [middlewares.multer.image('avatar'), ...getCookies]
module.exports.DELETE = [...getData]


