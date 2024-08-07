const express = require('express')
const router = express.Router()
const middlewares = require('../middlewares/posts')
const { fetchCookies, fetchUserByCookies } = require('../middlewares')

const access = require("../middlewares/roles");
const Post = require("../database/collections/posts");
const User = require("../database/collections/users/users");
const Response = require("../constants/response")

const getPosts = async authentication =>
{
    const publicPosts = await Post.find({ privacy: 'public' })
    const adminPosts = await Post.find({ privacy: 'admin' })

    if (authentication)
    {
        const id = authentication.id.toString()
        const user = await fetchUserByCookies(id)
        const privatePosts = await Post.find({ privacy: 'private', author: id })

        if (user.role[0] === 'client') return publicPosts

        return [...publicPosts, ...adminPosts, ...privatePosts]
    }
    else return publicPosts
}

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
        const posts = await getPosts(await fetchCookies(req))
        const output = []
        for (const post of posts)
        {
            const users = await User.find({ id: post.author })
            const author = users[0] || new User({ id: 'unknown', name: 'Unknown' })

            output.push({ ...post.toJSON(), author: author.toJSON(), content: '' })
        }
        res.json(output)
    }
}



const POST = async (req, res) =>
{
    const { data, keys, nodes, title, preview, privacy } = req.body
    const { files, picture } = req.files

    const author = res.locals.user.id
    const value = { privacy, content: JSON.parse(data), keys: JSON.parse(keys), files: files || [], author, nodes: JSON.parse(nodes), picture: picture ? picture[0] : null, title, preview }
    const post = new Post(value)

    res.json(await post.save())
}
const PATCH = async (req, res) =>
{
    const { data, keys, nodes, title, preview, privacy } = req.body
    const { files, picture } = req.files
    const post = res.locals.data
    const user = res.locals.user

    post.privacy = privacy

    if (user.id.toString() === post.author)
    {
        post.content = JSON.parse(data)
        post.keys = JSON.parse(keys)
        post.nodes = JSON.parse(nodes)
        post.files = files || []
        post.title = title
        post.preview = preview
        if (picture) post.picture = picture[0]
    }

    res.json(await post.save())
}
const DELETE = async (req, res) =>
{
    const post = res.locals.data
    await post.delete()
    res.json({ status: 'success' })
}

const exception = (req, res) =>
{
    const user = res.locals.user
    const post = res.locals.data

    return user.id.toString() === post.author
}

router.get('/', GET)
router.get('/:url', ...middlewares.GET, GET)
router.post('/', ...middlewares.POST, ...access('postsDB', 3), POST)
router.patch('/:id', ...middlewares.PATCH, ...access('postsDB', 4, exception), PATCH)
router.delete('/:id', ...middlewares.DELETE, ...access('postsDB', 5, exception), DELETE)

module.exports = router
