const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://abhi_new:Jv5fjH6GOtvm04Zn@cluster0.cedjm6o.mongodb.net/instagramclone?retryWrites=true&w=majority&appName=Cluster0").then(()=>{
 console.log('mongoose connected sueccessfully');
  }).catch((err)=>{
    console.log("mongoose not connected",err);
    
})

