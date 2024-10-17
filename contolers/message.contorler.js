// const mongoose = require('mongoose')
// // const { login } = require('./user.contorler')
// const conversation = require('../models/conversation.model');
const conversation = require('../models/conversation.model')
const Message = require('../models/message.model')
const { getReceiverSocketId, io } = require('../socket/socket.io')

// for chatting
const sendmessage = async (req, res) => {
    try {
        const senderId = req.user;
        const receiverId = req.params.id;
        const { textMessage: message } = req.body;
        console.log(message);

        if (!message) {
            return res.status(400).send({ success: false, message: "Message  is required" });
        }

        // Check if a conversation already exists between sender and receiver
        let conversations = await conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        // Create a new conversation if it doesn't exist
        if (!conversations) {
            conversations = await conversation.create({
                participants: [senderId, receiverId]
            });
        }

        // Create the new message
        const newmessage = await Message.create({
            sender: senderId,
            receiverID: receiverId,
            message
        });

        // Push the message to the conversation
        conversations.messages?.push(newmessage._id);
        await conversations.save();
        await newmessage.save();

        // Emit the message in real-time via Socket.IO if the receiver is online
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newmessage);
        }

        // Respond with success and the new message
        console.log(newmessage,"newmessage");
        
        return res.status(201).send({ success: true, newmessage });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, message: "Something went wrong. Please try again later." });
    }
};

const GetAllMessage = async (req, res) => {
    try {
        const senderId = req.user;
        const receiverId = req.params.id;
        const conversion = await conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate('messages')
        if (!conversion) {
            return res.status(200).send({ success: true, messages: [] })
        }
        return res.status(201).send({ success: true, messages: conversion?.messages })

    } catch (error) {
        console.log(error);

    }
}
module.exports = { sendmessage, GetAllMessage }