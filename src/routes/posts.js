const express = require('express')
const router = express.Router()
const middlewares = require('../middlewares/posts')
const access = require("../middlewares/roles");
const Post = require("../database/collections/posts");
const User = require("../database/collections/users/users");
const Response = require("../constants/response");

const GET  = async (req, res, next) =>
{
    if (res.locals.data)
    {
        const post = res.locals.data
        const users = await User.find({ id: post.author })
        const author = users[0]
        if (author) res.json({ ...post.toJSON(), author: author.toJSON() })
        else next(Response.Error.NotFound({ author: post.author }))

    }
    else
    {
        const posts = await Post.find()
        const output = []
        for (const post of posts)
        {
            const users = await User.find({ id: post.author })
            const author = users[0]

            if (author) output.push({ ...post.toJSON(), author: author.toJSON() })
            else
            {
                next(Response.Error.NotFound({ author: post.author }))
                return
            }
        }

        res.json(output)
    }
}



const POST = async (req, res) =>
{
    const { data, keys, nodes, title, preview } = req.body
    const { files, picture } = req.files

    const author = res.locals.user.id
    const value = { content: JSON.parse(data), keys: JSON.parse(keys), files: files || [], author, nodes: JSON.parse(nodes), picture: picture ? picture[0] : null, title, preview }
    const post = new Post(value)

    res.json(await post.save())
}
const PATCH = async (req, res) =>
{
    const { data, keys, nodes, title, preview } = req.body
    const { files, picture } = req.files
    const post = res.locals.data

    post.content = JSON.parse(data)
    post.keys = JSON.parse(keys)
    post.nodes = JSON.parse(nodes)
    post.files = files || []
    post.title = title
    post.preview = preview
    if (picture) post.picture = picture[0]


    res.json(await post.save())
}
const DELETE = async (req, res, next) =>
{
    const post = res.locals.data
    await post.delete()
    res.json({ status: 'success' })
}



router.get('/', GET)
router.get('/:url', ...middlewares.GET, GET)
router.post('/', ...access('postsDB', 3), ...middlewares.POST, POST)
router.patch('/:id', ...access('postsDB', 4), ...middlewares.PATCH, PATCH)
router.delete('/:id', ...access('postsDB', 5), ...middlewares.DELETE, DELETE)

module.exports = router
