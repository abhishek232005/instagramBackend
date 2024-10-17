const mongoose = require('mongoose')

const messageschame =new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"},
        receiverID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"},
            message:{type:String,required:true}
})

const Message = mongoose.model('message',messageschame)
module.exports = Message