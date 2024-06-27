const express = require('express')
const router = express.Router()
const middlewares = require('../middlewares/users')
const User = require('../database/collections/users')

const GET = (req, res) =>
{
    if (res.locals.data) res.json(res.locals.data)
    else User.find().then(result => res.json(result))
}
const POST = async (req, res, next) =>
{
    const { username, password, fullname } = req.body
    const image = req.file
    const user = new User({ username, password, fullname, image })
    const response = await user.save()
    next(response)
}
const PATCH = async (req, res, next) =>
{
    const user =  res.locals.data
    const image = req.file

    Object.keys(req.body).forEach(key => user[key] = req.body[key])
    user.image = image

    const response = await user.save()
    next(response)
}
const DELETE = async (req, res, next) =>
{
    const user =  res.locals.data
    const response = await user.delete()
    next(response)
}


router.get('/', GET)
router.get('/:id', ...middlewares.GET, GET)
router.post('/', ...middlewares.POST, POST)
router.patch('/:id', ...middlewares.PATCH, PATCH)
router.delete('/:id', ...middlewares.DELETE, DELETE)

module.exports = router
