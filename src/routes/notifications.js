const express = require('express')
const router = express.Router()
const Notification = require('../database/collections/notification')
const middlewares = require('../middlewares/notifications')

const GET = async (req, res) =>
{
    const user = res.locals.user
    res.json(await Notification.find({ code: user.id.toString() }))
}
const LAST = async (req, res) =>
{
    const user = res.locals.user
    res.json((await Notification.find({ code: user.id.toString() })).slice(-1)[0])
}


const CLEAR = async (req, res) =>
{
    const user = res.locals.user
    res.json(await Notification.clear({ code: user.id.toString() }))
}

const DELETE = async (req, res) =>
{
    const notification = res.locals.data
    res.json(await notification.delete())
}


router.get('/', ...middlewares.GET, GET)
router.get('/last', ...middlewares.GET, LAST)

router.delete('/:id', ...middlewares.DELETE, DELETE)
router.delete('/', ...middlewares.CLEAR, CLEAR)

module.exports = router
