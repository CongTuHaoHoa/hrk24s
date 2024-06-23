const express = require('express')
const router = express.Router()
const database = require('../../database/collections/usersAdmin')
const middlewares = require('../../middlewares/users/admin')

const GET = (req, res) =>
{
    if (res.locals.data) res.json(res.locals.data)
    else database().then(result => res.json(result))
}
const POST = (req, res) =>
{
    const { username, password, name } = req.body
    const image = req.file

    database.ADD({ username, password, name, image }).then(response => { res.status(response.code).json(response) })
}
const PATCH = (req, res) =>
{
    const { username, password, name, avatar } = req.body
    const image = avatar === String(false) ? false : req.file

    database.EDIT(res.locals.data, { username, password, name, image }).then(response => { res.status(response.code).json(response) })
}
const DELETE = (req, res) =>
{
    database.DELETE(res.locals.data).then(response => { res.status(response.code).json(response) })
}


router.get('/', GET)
router.get('/:_id', ...middlewares.GET, GET)
router.post('/', ...middlewares.POST, POST)
router.patch('/:_id', ...middlewares.PATCH, PATCH)
router.delete('/:_id', ...middlewares.DELETE, DELETE)

module.exports = router
