const response = require("../../constants/response")
const multer = require("multer");
const path = require("path");
const storage = multer.memoryStorage()

const IMAGE = { mime : /jpeg|jpg|png/, message : 'Only JPG, JPEG, PNG allow !!' }

const fileFilter = (req, file, callback, type) => (type.mime.test(file.mimetype) && type.mime.test(path.extname(file.originalname).toLowerCase())) ? callback(null, true) : callback(new Error(type.message))
const upload = type => multer({ storage, fileFilter: (req, file, callback) => fileFilter(req, file, callback, type) })

const image = name => upload(IMAGE).single(name)
const any = multer().any()

const isMissing = (fieldNames, body) =>
{
    const missing = fieldNames.map(value => body[value] === undefined ? value : null)
    const fields = missing.filter(value => value !== null)
    return fields.length > 0 ? response.ERROR.MISSING(fields) : response.SUCCESS.COMPLETE
}
const existID = (req, res, next) =>
{
    const missing = response.ERROR.MISSING(['_id'])
    if (req.params._id) next()
    else res.status(missing.code).json(missing)
}
const getDataByID = (req, res, next, database) =>
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


module.exports.checkExistFields = (req, res, next, fields) =>
{
    const missing = isMissing(fields, req.body)
    if (missing.error)  res.status(missing.code).json(missing)
    else next()
}
module.exports.getData = database => [existID, (req, res, next) => getDataByID(req, res, next, database)]





module.exports.multer = { any, image }