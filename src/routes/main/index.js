const express = require('express')
const router = express.Router()


const GET = (req, res) =>
{
    res.render('index', { title: 'Express' })
}


router.get('/', GET)

module.exports = router