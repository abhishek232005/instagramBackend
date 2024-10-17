const express = require('express')
const authenticated = require('../middlwares/authenticate')
const { sendmessage, GetAllMessage } = require('../contolers/message.contorler')
const messageroute = express.Router()

messageroute.post('/send/:id',authenticated,sendmessage)
messageroute.get('/all/:id',authenticated,GetAllMessage)
module.exports = messageroute