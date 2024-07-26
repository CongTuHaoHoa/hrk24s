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
const images = name => upload(IMAGE).array(name)
const imageFields = names => upload(IMAGE).fields(names.map(name => ({ name })))

const any = multer().any()

const exist = by => (req, res, next) => next(req.params[by] ? null : Response.Error.MissingFields([by]))
const getData = (by, database) => (req, res, next) =>
{
    const value = req.params[by]

    database.find({ [by]: value }).then(result =>
    {
        res.locals.data = result[0]
        next(result[0] ? null : Response.Error.NotFound({ [by]: value }))
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
module.exports.getDataByID = database => [exist('id'), getData('id', database)]
module.exports.getData = (by, database) => [exist(by), getData(by, database)]
module.exports.getCookies = [checkCookies, getUserByCookies]
module.exports.checkCookies = checkCookies
module.exports.multer = { any, image, images, fields: { image: imageFields } }