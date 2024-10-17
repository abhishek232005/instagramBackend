const jwt = require('jsonwebtoken')
const User = require('../models/user.model');

const authenticated = async (req,res,next)=>{
    try {
        const {token} = req.headers

        if(!token){
            res.status(401).send({message:"token is required",success:false})
        }
        const decode = await jwt?.verify(token,"abhishekgwala2005")
        console.log(decode, "decode");
        
        if(!decode){
            res.status(401).send({message:"Invailed token",success:false})
        }

        const find_user = await User.findOne({_id:decode.id})
        if(!find_user){
            return res.status(401).send({message:"user not found"})
        }
        req.user = find_user._id
        next()
    } catch (error) {
        console.log(error);
        
    }
}

module.exports = authenticated

