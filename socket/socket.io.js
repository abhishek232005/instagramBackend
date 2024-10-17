const { Server } = require('socket.io');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server with CORS configuration
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Frontend origin
        methods: ['GET', 'POST']
    }
});

const userSocketMap = {}; // This map stores socket IDs corresponding to user IDs: userId => socketId

// Function to get the receiver's socket ID
const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId; // Retrieve userId from the handshake query
    
    if (userId) {
        // Assign the socket ID to the user's ID
        userSocketMap[userId] = socket.id;
        console.log(`User connected: userId = ${userId}, socketId = ${socket.id}`);
    }
    
    // Emit the updated list of online users to all connected clients
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
    console.log(`Connected Users: `, Object.keys(userSocketMap));

    // Handle socket disconnection
    socket.on('disconnect', () => {
        if (userId) {
            console.log(`User disconnected: userId = ${userId}, socketId = ${socket.id}`);
            delete userSocketMap[userId]; // Remove the user from the map
        }
        
        // Emit the updated list of online users after a user disconnects
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});

// Export the io server, express app, and the getReceiverSocketId function
module.exports = { io, app, server, getReceiverSocketId };
