const mongoose = require('mongoose')

const conversationSchame = new mongoose.Schema({
    // con conpati sipat hai 
    participants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    messages:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"message"
    }],
})

const conversation = mongoose.model('conversation',conversationSchame)
module.exports = conversation