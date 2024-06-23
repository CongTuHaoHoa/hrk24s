const path = require("path")
const multer = require("multer")
const response = require('../../constants/response')
const database = require('../../database/collections/usersAdmin')

const storage = multer.memoryStorage()
const fileFilter = (req, file, callback) => (/jpeg|jpg|png/.test(file.mimetype) && /jpeg|jpg|png/.test(path.extname(file.originalname).toLowerCase())) ? callback(null, true): callback(new Error('Chỉ cho phép tải lên các file ảnh!'))
const upload = multer({ storage, fileFilter })

const isMissing = (fieldNames, body) =>
{
    const missing = fieldNames.map(value => body[value] === undefined ? value : null)
    const fields = missing.filter(value => value !== null)
    return fields.length > 0 ? response.ERROR.MISSING(fields) : response.SUCCESS
}


const loadFromDatabaseByID = (req, res, next) =>
{
    const _id = req.params._id

    database({ _id }).then(result =>
    {
        if (result[0])
        {
            res.locals.data = result[0]
            next()
        }
        else
        {
            const error = response.ERROR.NOTFOUND({ _id })
            res.status(error.code).json(error)
        }
    })
}
const usernameExist = (req, res, next) =>
{
    const { username } = req.body
    database({ username }).then(result =>
    {
        if (result.length)
        {
            const error = response.ERROR.EXISTS({ username })
            res.status(error.code).json(error)
        }
        else next()
    })
}


const fieldsNEW = (req, res, next) =>
{
    const missing = isMissing(['username', 'password', 'name'], req.body)
    if (missing.error)  res.status(missing.code).json(missing)
    else next()
}
const fieldsEXIST = (req, res, next) =>
{
    const missing = response.ERROR.MISSING(['_id'])
    if (req.params._id) next()
    else res.status(missing.code).json(missing)
}


const EXIST = [fieldsEXIST, loadFromDatabaseByID]


module.exports.GET = [...EXIST]
module.exports.POST = [upload.single('avatar'), fieldsNEW, usernameExist]
module.exports.PATCH = [upload.single('avatar'), ...EXIST]
module.exports.DELETE = [...EXIST]


