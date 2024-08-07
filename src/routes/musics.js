const express = require('express')
const router = express.Router()
const middlewares = require('../middlewares/musics')
const { fetchCookies, fetchUserByCookies } = require('../middlewares')

const access = require("../middlewares/roles");
const Music = require("../database/collections/musics")
const User = require("../database/collections/users/users");
const Response = require("../constants/response")
const path = require("path")

const getMusics = async authentication =>
{
    const publicMusics = await Music.find({ privacy: 'public' })
    const adminMusics = await Music.find({ privacy: 'admin' })

    if (authentication)
    {
        const id = authentication.id.toString()
        const user = await fetchUserByCookies(id)
        const privateMusics = await Music.find({ privacy: 'private', artist: id })

        if (user.role[0] === 'client') return publicMusics

        return [...publicMusics, ...adminMusics, ...privateMusics]
    }
    else return publicMusics
}

const GET  = async (req, res, next) =>
{
    if (res.locals.data)
    {
        const music = res.locals.data
        const users = await User.find({ id: music.artist })
        const artist = users[0]
        if (artist) res.json({ ...music.toJSON(), artist: artist.toJSON() })
        else next(Response.Error.NotFound({ artist: music.artist }))
    }
    else
    {
        const musics = await getMusics(await fetchCookies(req))
        const output = []
        for (const music of musics)
        {
            const users = await User.find({ id: music.artist })
            const artist = users[0] || new User({ id: 'unknown', name: 'Unknown' })

            output.push({ ...music.toJSON(), artist: artist.toJSON() })
        }

        res.json(output)
    }
}
const POST = async (req, res) =>
{
    const { name, privacy } = req.body
    const user = res.locals.user

    let { audio, picture } = req.files
    audio = audio ? audio[0] : null
    picture = picture ? picture[0] : null

    const data = { audio, picture, name, privacy, artist: user }
    if (!data.picture) delete data.picture
    if (!data.audio) delete data.audio
    const music = new Music(data)
    res.json(await music.save())
}
const VIEWS = async (req, res) =>
{
    const music = res.locals.data
    music.views++
    res.json(await music.save())
}
const PATCH = async (req, res) =>
{
    const { name, privacy } = req.body
    const user = res.locals.user
    const music = res.locals.data

    let { audio, picture } = req.files
    audio = audio ? audio[0] : null
    picture = picture ? picture[0] : null

    if (privacy) music.privacy = privacy
    if (user.id.toString() === music.artist)
    {
        if (name) music.name = name
        if (audio) music.audio = audio
        if (picture) music.picture = picture
    }

    res.json(await music.save())
}
const PUT = (req, res) =>
{
    const music = res.locals.data
    const directory = '../../public'
    const filepath = path.join(__dirname, directory, music.audio)

    res.download(filepath, `${ music.name }.mp3`)
}
const DELETE = async (req, res) =>
{
    const music = res.locals.data
    res.json(await music.delete())
}

const exception = (req, res) =>
{
    const user = res.locals.user
    const music = res.locals.data

    return user.id.toString() === music.artist
}

router.get('/', GET)
router.get('/:id', ...middlewares.GET, GET)
router.post('/', ...middlewares.POST, ...access('musicsDB', 3), POST)
router.post('/:id', ...middlewares.VIEWS, VIEWS)

router.patch('/:id', ...middlewares.PATCH, ...access('musicsDB', 4, exception), PATCH)
router.put('/:id', ...middlewares.PUT, PUT)
router.delete('/:id', ...middlewares.DELETE, ...access('musicsDB', 5, exception), DELETE)

module.exports = router
