const express = require('express')
const userroute = require('./routes/user.route');
const messageroute = require('./routes/message.route')
const postroute = require('./routes/post.route')
const cors = require('cors');
require('./db/mongoose')
const cookieParser = require('cookie-parser'); // Corrected casing
const {app,server} = require('./socket/socket.io')
const path = require('path')
const port = 4000;

const ___dirname = path.resolve()
console.log(___dirname);

// const path = require('path')
app.get('/', (req, res) => {
    return res.status(200).send({
        message: "I am coming from the backend", // Corrected typo
        success: true // Corrected type
    });
});
// app.use("/upload",express.static(path.join(__dirname,"./upload")))
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const corsOption = {
    origin: ["http://localhost:5173"],
    // credentials: true // Fixed casing
};
app.use(cors());

app.use('/api', userroute);
app.use('/api', messageroute);
app.use('/api', postroute);

app.use(express.static(path.join(___dirname, '/frontend/dist')))
app.get("*",(req,res)=>{
    res.sendFile(path.resolve(___dirname,"frontend", "dist", "index.html"))
})
server.listen(port, () => {
    console.log(`Server listening at port ${port}`);
});
