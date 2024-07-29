const middlewares = require("./index")
const Response = require("../constants/response");
const Roles = require("../database/collections/roles");
const User = require("../database/collections/users/users");
const getAccess = require('../constants/access')

const check = (keyword, access, exception) => async (req, res, next) =>
{
    const user = res.locals.user


    if (user.role.filter(role => role === 'sysadmin').length > 0)
    {
        res.locals.access = { level : 9999, keyword }
        next()
    }
    else if (!keyword) next(Response.Error.Forbidden)
    else if (user.role.filter(role => role === 'client').length > 0) next(access < 1 ? null : Response.Error.Forbidden)
    else
    {
        const role = await getAccess(user.role)
        const allow = role[keyword] >= access || (exception ? exception(req, res) : false)

        res.locals.access = { level : role[keyword], keyword }

        next(allow ? null : Response.Error.Forbidden)
    }
}

const getData = middlewares.getDataByID(Roles)
const checkBlankFields = middlewares.checkBlankFields(['name', 'color', 'icon', 'adminDB', 'clientDB'])
const checkExistFields = middlewares.checkExistFields(['name', 'color', 'icon', 'adminDB', 'clientDB'])

const checkDeleteDefault = (req, res, next) =>
{
    const { id } = res.locals.data
    next(id.toString() === '6690bf5d7cfd918869b42bf5' ? Response.Error.DeleteDefault : null)
}

const checkDeleteButHaveUsers = async (req, res, next) =>
{
    const { id } = res.locals.data
    const found = await User.find({ role: id })

    next(found.length ? Response.Error.DeleteFather : null)
}

const grantAccess = (keyword = null, access = 0, exception = null) => [...middlewares.getCookies, check(keyword, access, exception)]

const checkDelete = [checkDeleteDefault, checkDeleteButHaveUsers]

module.exports = grantAccess
module.exports.CHECK = [...middlewares.getCookies]

// module.exports.ALL = [...grantAccess('adminDB', 2)]
// module.exports.ALL = []

module.exports.GET = [...grantAccess('adminDB', 2), ...getData]

module.exports.POST = [...grantAccess(), middlewares.multer.any, checkExistFields]
module.exports.PATCH = [...grantAccess(), middlewares.multer.any, checkBlankFields, ...getData]
module.exports.DELETE = [...grantAccess(), ...getData, ...checkDelete]
