const express = require('express')
const router = express.Router()
const middlewares = require('../middlewares/facebook')
const accessToken = require('../constants/accessToken')
const User = require("../database/collections/users");
const response = require("../constants/response");
const Authentication = require("../database/collections/authentication");

const POST = async (req, res, next) =>
{
    const { access_token } = req.body
    const { facebook } = await accessToken.facebook(access_token)

    const user = (await User.find({ facebook }))[0]

    if (user)
    {
        const authentication = new Authentication(user.id)
        const token = await authentication.save()

        res.cookie('token', token)

        if (!authentication.verify && user.totp) res.json({ token })
        else res.json(user)
    }
    else next(response.ERROR.NOTFOUND({ facebook }))
}

const PATCH = async (req, res, next) =>
{
    const { access_token } = req.body

    const { facebook, facebookName, facebookMail, facebookPicture } = await accessToken.facebook(access_token)

    const authentication = res.locals.data

    const user = (await User.find({ id: authentication.id.toString() }))[0]

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
        else next(response.ERROR.EXISTS({ facebook }))
    }
    else next(response.ERROR.NOTALLOWED('blank email'))
}

router.post('/', ...middlewares.POST, POST)
router.patch('/', ...middlewares.PATCH, PATCH)

module.exports = router
