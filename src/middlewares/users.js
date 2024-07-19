const Response = require('../constants/response')
const middlewares = require('./index')
const User = require('../database/collections/users/users')
const getAccess = require("../constants/access");
const { array } = require("../constants/access");

const getData = middlewares.getData(User)
const getCookies = middlewares.getCookies

const checkExistFields = middlewares.checkExistFields(['username', 'password', 'fullname', 'role'])

const checkBlankFields = middlewares.checkBlankFields(['username', 'fullname', 'role'])

const alreadyHaveUserName = async (req, res, next) =>
{
    const { username } = req.body
    const founds = await  User.find({ username })
    if (founds.length)
    {
        const found = founds[0]
        if (res.locals.data) next(res.locals.data.id.toString() === found.id.toString() ? null : Response.Error.Exists(username))
        else next(Response.Error.Exists(username))
    }
    else next()
}

const checkRoleWithCurrent = async (req, res, next) =>
{
    const { keyword, level } = res.locals.access
    const user = res.locals.data

    const found = await getAccess(user.role)
    next(found[keyword] < level ? null : Response.Error.HigherRankInteract)
}

const checkRoleWithUpdate = async (req, res, next) =>
{
    const { role } = req.body

    if (role)
    {
        const { level } = res.locals.access

        const found = await getAccess(array(role))
        next(found.adminDB < level ? null : Response.Error.HigherRankEdit)
    }
    else next()
}


const checkRole = [checkRoleWithCurrent, checkRoleWithUpdate]

module.exports.GET = [...getData]
module.exports.POST = [middlewares.multer.image('avatar'), checkExistFields, alreadyHaveUserName, checkRoleWithUpdate]
module.exports.PATCH = [middlewares.multer.image('avatar'), checkBlankFields, ...getData, alreadyHaveUserName, ...checkRole]
module.exports.PROFILE = [middlewares.multer.image('avatar'), checkBlankFields, ...getCookies]
module.exports.DELETE = [...getData, checkRoleWithCurrent]


