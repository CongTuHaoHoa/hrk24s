const express = require('express')
const router = express.Router()
const middlewares = require('../middlewares/roles')
const Role = require('../database/collections/roles')
const Response = require('../constants/response')
const getAccess = require("../constants/access");

const CHECK = async (req, res) =>
{
    const user = res.locals.user
    const { adminDB, clientDB, postsDB, artsDB, musicsDB, messagesDB } = await getAccess(user.role)
    res.json({ adminDB, clientDB, postsDB, artsDB, musicsDB, messagesDB })
}

const GET = (req, res) =>
{
    if (res.locals.data) res.json(res.locals.data)
    else Role.find().then(result => res.json(result))
}

const POST = async (req, res) =>
{
    const role = new Role(req.body)
    res.json(await role.save())
}
const PATCH = async (req, res) =>
{
    const role = res.locals.data

    console.log(res.locals.data)
    console.log(req.body)


    Object.keys(req.body).forEach(key => role[key] = req.body[key])
    res.json(await role.save())
}
const DELETE = async (req, res) =>
{
    const role = res.locals.data
    await role.delete()
    res.json(Response.Success.Delete)
}


router.get('/', ...middlewares.CHECK, CHECK)

router.get('/all', ...middlewares.ALL, GET)
router.get('/:id', ...middlewares.ONE, GET)

router.post('/', ...middlewares.POST, POST)
router.patch('/:id',...middlewares.PATCH, PATCH)
router.delete('/:id',...middlewares.DELETE, DELETE)

module.exports = router
