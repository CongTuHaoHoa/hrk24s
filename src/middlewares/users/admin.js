const response = require('../../constants/response')
const middlewares = require('../main')
const database = require('../../database/collections/usersAdmin')

const getData = middlewares.getData(database)
const checkExistFields = (req, res, next) =>
middlewares.checkExistFields(req, res, next, ['username', 'password', 'name'])


const alreadyHaveUserName = (req, res, next) =>
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


module.exports.GET = [...getData]
module.exports.POST = [middlewares.multer.image('avatar'), checkExistFields, alreadyHaveUserName]
module.exports.PATCH = [middlewares.multer.image('avatar'), ...getData]
module.exports.DELETE = [...getData]


