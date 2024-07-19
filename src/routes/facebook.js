const express = require('express')
const router = express.Router()
const middlewares = require('../middlewares/facebook')
const accessToken = require('../constants/accessToken')
const Admin = require("../database/collections/users/admin");
const User = require("../database/collections/users/users");

const Response = require("../constants/response");

const Authentication = require("../database/collections/authentication");

const POST = database => async (req, res, next) =>
{
    const { access_token } = req.body
    const { facebook, facebookName, facebookMail, facebookPicture } = await accessToken.facebook(access_token)

    const user = (await database.find({ facebook }))[0]

    if (user)
    {
        const authentication = new Authentication(user.id)
        const token = await authentication.save()

        res.cookie('token', token)

        if (!authentication.verify && user.totp)
        {
            user.facebookMail = facebookMail
            user.facebookName = facebookName
            user.facebookPicture = facebookPicture

            await user.save()

            res.json({ token })
        }
        else
        {
            user.facebookMail = facebookMail
            user.facebookName = facebookName
            user.facebookPicture = facebookPicture

            await user.save()

            res.json(user)
        }
    }
    else next(Response.Error.NotFound({ facebookName }))
}

const PATCH = async (req, res, next) =>
{
    const { access_token } = req.body
    const { facebook, facebookName, facebookMail, facebookPicture } = await accessToken.facebook(access_token)
    const user = res.locals.user

    if (!user.facebook)
    {
        const check = (await User.find({ facebook }))

        if (check.length === 0)
        {
            user.facebook = facebook
            user.facebookMail = facebookMail
            user.facebookName = facebookName
            user.facebookPicture = facebookPicture

            res.json(await user.save())
        }
        else next(Response.Error.Exists(facebookName))
    }
    else next(Response.Error.MethodNotAllow)
}

const DELETE = async (req, res) =>
{
    const user = res.locals.user

    user.facebook = ''
    user.facebookMail = ''
    user.facebookName = ''
    user.facebookPicture = ''

    res.json(await user.save())
}

router.post('/', ...middlewares.POST, POST(User))
router.post('/admin', ...middlewares.POST, POST(Admin))

router.patch('/', ...middlewares.PATCH, PATCH)
router.delete('/', ...middlewares.DELETE, DELETE)

module.exports = router
