const Response = require("../constants/response")
const multer = require("multer");
const path = require("path");
const Authentication = require("../database/collections/authentication");
const User = require("../database/collections/users/users");
const storage = multer.memoryStorage()
const IMAGE = { mime : /jpeg|jpg|png/, error: Response.Error.File('JPG, JPEG, PNG') }

const fileFilter = type => (req, file, callback) => (type.mime.test(file.mimetype) && type.mime.test(path.extname(file.originalname).toLowerCase())) ? callback(null, true) : callback(type.error)
const upload = type => multer({ storage, fileFilter: fileFilter(type) })

const image = name => upload(IMAGE).single(name)
const any = multer().any()

const existID = (req, res, next) =>
{
    next(req.params.id ? null : Response.Error.MissingFields(['id']))
}
const getDataByID = database => (req, res, next) =>
{
    const id = req.params.id

    database.find({ id }).then(result =>
    {
        res.locals.data = result[0]
        next(result[0] ? null : Response.Error.NotFound({ id }))
    })
}
const getUserByCookies = async (req, res, next) =>
{
    if (res.locals.user) next()
    else
    {
        const id = res.locals.authentication.id.toString()

        const result = await  User.find({ id })
        res.locals.user = result[0]
        next(result[0] ? null : Response.Error.NotFound({ id }))
    }
}
const checkCookies = async (req, res, next) =>
{
    const filter = { token } = req.cookies

    if (token)
    {
        const authentication = (await Authentication.find(filter))[0]

        if (authentication)
        {
            res.locals.authentication = authentication
            next()
        }
        else next(Response.Error.Authentication)
    }
    else next(Response.Error.Authentication)
}
const checkExistFields = fields => (req, res, next) =>
{
    const missingCheck = fields.map(value => req.body[value] === undefined ? value : req.body[value].length > 0 ? null : value)
    const missingList = missingCheck.filter(value => value !== null)

    next(missingList.length ? Response.Error.MissingFields(missingList) : null)
}
const checkBlankFields = fields => (req, res, next) =>
{
    const missingCheck = fields.map(value => req.body[value] === undefined ? null : req.body[value].length > 0 ? null : value)
    const missingList = missingCheck.filter(value => value !== null)
    next(missingList.length ? Response.Error.BlankFields(missingList) : null)
}

module.exports.checkExistFields = checkExistFields
module.exports.checkBlankFields = checkBlankFields
module.exports.getData = database => [existID, getDataByID(database)]
module.exports.getCookies = [checkCookies, getUserByCookies]
module.exports.checkCookies = checkCookies
module.exports.multer = { any, image }