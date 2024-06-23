const express = require('express')
const router = express.Router()
const database = require('../../database/collections/usersAdmin')
const response = require('../../constants/response')
const middlewares = require('../../middlewares/authentication/admin')

const POST = (req, res) =>
{
    const { username, password } = req.body
    const error = response.ERROR.NOTFOUND({ username })

    database({ username, password }).then(result =>
    {
        if (result.length === 1) res.json(response.SUCCESS.COMPLETE)
        else res.status(error.code).json(error)
    })
}


router.post('/',...middlewares.POST, POST)

module.exports = router
