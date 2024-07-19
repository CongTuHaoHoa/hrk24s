const middlewares = require('./index')
const Response = require('../constants/response')

const Authentication = require("../database/collections/authentication");
const Socket = require('../constants/socket')

const checkExistFields = middlewares.checkExistFields(['username', 'password'])

const checkUsernamePassword = database => async (req, res, next) =>
{
    const { username, password } = req.body
    const users = await database.find({ username, password })

    if (users.length === 1)
    {
        res.locals.user = users[0]
        next()
    }
    else next(Response.Error.Password)
}
const checkOnline = async (req, res, next) =>
{
    const { id } = res.locals.user
    const authentications = await Authentication.find({ id: id.toString() })

    if (authentications.length === 0) next()
    else
    {
        for (const authentication of authentications) await authentication.delete()
        Socket.send('authentication', authentications[0].id)
        next()
    }
}

module.exports.GET = [middlewares.checkCookies]
module.exports.POST = database => [middlewares.multer.any, checkExistFields, checkUsernamePassword(database), checkOnline]
module.exports.DELETE = [middlewares.checkCookies]

