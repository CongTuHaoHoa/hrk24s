const express = require('express')
const router = express.Router()
const middlewares = require('../middlewares/users')
const Admin = require('../database/collections/users/admin')
const Client = require('../database/collections/users/client')
const User = require('../database/collections/users/users')

const access = require("../middlewares/roles");

const GET = database => (req, res) =>
{
    if (res.locals.data) res.json(res.locals.data)
    else database.find().then(result => res.json(result))
}
const POST = async (req, res) =>
{
    const { username, password, fullname, role } = req.body
    const image = req.file

    const user = new User({ username, password, fullname, image, role })

    res.json(await user.save())
}
const PATCH = async (req, res) =>
{
    const user =  res.locals.data || res.locals.user
    const image = req.file
    
    Object.keys(req.body).forEach(key => user[key] = ((key === 'avatar') ? (req.body[key] === 'false' ? false : user[key]) : req.body[key]))
    user.image = image

    res.json(await user.save())
}
const DELETE = async (req, res, next) =>
{
    const user =  res.locals.data
    const response = await user.delete()
    next(response)
}


router.patch('/', ...middlewares.PROFILE, PATCH)

router.get('/admin', ...access('adminDB', 2), GET(Admin))
router.get('/client', ...access('clientDB', 2), GET(Client))
router.get('/:id', ...middlewares.GET, GET(User))

router.post('/admin', ...access('adminDB', 3), ...middlewares.POST, POST)

router.patch('/admin/:id', ...access('adminDB', 4), ...middlewares.PATCH, PATCH)
router.patch('/client/:id', ...access('clientDB', 4), ...middlewares.PATCH, PATCH)

router.delete('/admin/:id', ...access('adminDB', 5), ...middlewares.DELETE, DELETE)
router.delete('/client/:id', ...access('clientDB', 5), ...middlewares.DELETE, DELETE)

module.exports = router
