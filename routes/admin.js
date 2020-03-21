const express = require('express')
const fs = require('fs')
const path = require('path')

const router = express.Router()

router.get('/add-product', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'add-product.html'))
})

router.post('/add-product', (req, res, next) => {
    fs.writeFileSync('message.txt', req.body.title)
    res.redirect('/')
})

module.exports = router