const response = require("../constants/response")
const multer = require("multer");
const path = require("path");
const storage = multer.memoryStorage()

const IMAGE = { mime : /jpeg|jpg|png/, error: response.ERROR.NOTALLOWED('JPG, JPEG, PNG') }

const fileFilter = (req, file, callback, type) => (type.mime.test(file.mimetype) && type.mime.test(path.extname(file.originalname).toLowerCase())) ? callback(null, true) : callback(type.error)
const upload = type => multer({ storage, fileFilter: (req, file, callback) => fileFilter(req, file, callback, type) })

const image = name => upload(IMAGE).single(name)
const any = multer().any()

const existID = (req, res, next) =>
{
    next(req.params.id ? null : response.ERROR.MISSING(['id']))
}
const getDataByID = (req, res, next, database) =>
{
    const id = req.params.id

    database.find({ id }).then(result =>
    {
        res.locals.data = result[0]
        next(result[0] ? null : response.ERROR.NOTFOUND({ id }))
    })
}


module.exports.checkExistFields = (req, res, next, fields) =>
{
    const missingCheck = fields.map(value => req.body[value] === undefined ? value : null)
    const missingList = missingCheck.filter(value => value !== null)
    next(missingList.length ? response.ERROR.MISSING(missingList) : null)
}
module.exports.getData = database => [existID, (req, res, next) => getDataByID(req, res, next, database)]



module.exports.multer = { any, image }