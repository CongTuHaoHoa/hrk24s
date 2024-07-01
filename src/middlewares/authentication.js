const middlewares = require('./index')
const response = require('../constants/response')
const User = require("../database/collections/users");
const Authentication = require("../database/collections/authentication");

const checkExistFields = (req, res, next) =>
    middlewares.checkExistFields(req, res, next, ['username', 'password'])

const checkUsernamePassword = async (req, res, next) =>
{
    const { username, password } = req.body
    const users =  await User.find({ username, password })

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
    const { id } = res.locals.data.user
    const authentications = await Authentication.find({ id: id.toString() })

    if (authentications.length === 0) next()
    else
    {
        for (const authentication of authentications)
        {
            await authentication.delete()
        }

        next()
    }
}

module.exports.GET = [middlewares.checkCookies]

module.exports.POST = [middlewares.multer.any, checkExistFields, checkUsernamePassword, checkOnline]
module.exports.DELETE = [middlewares.checkCookies]

