const middlewares = require('./index')
const response = require('../constants/response')
const User = require("../database/collections/users");
const Authentication = require("../database/collections/authentication");

const checkExistFields = (req, res, next) =>
    middlewares.checkExistFields(req, res, next, ['username', 'password'])

const checkCookies = async (req, res, next) =>
{
    const filter = { token } = req.cookies
    if (token)
    {
        const authentication = (await Authentication.find(filter))[0]

        if (authentication)
        {
            res.locals.data = authentication
            next()
        }
        else next(response.ERROR.NOTFOUND({ token }))
    }
    else next(response.ERROR.NOTALLOWED('token'))
}

const checkUsernamePassword = async (req, res, next) =>
{
    const filter = { username, password } = req.body
    const users =  await User.find(filter)


    if (users.length === 1)
    {
        const user = users[0]
        res.locals.data = { user }
        next()
    }
    else next(response.ERROR.NOTFOUND({ username }))
}
const checkOnline = async (req, res, next) =>
{
    const filter = { id } = res.locals.data.user
    const authentications = await Authentication.find(filter)
    next(authentications.length === 0 ? null : response.ERROR.EXISTS({ username: res.locals.data.user.username }))
}

module.exports.GET = [checkCookies]
module.exports.POST = [middlewares.multer.any, checkExistFields, checkUsernamePassword, checkOnline]
module.exports.DELETE = [checkCookies]

