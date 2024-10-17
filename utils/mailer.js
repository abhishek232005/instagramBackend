const nodemailer = require("nodemailer")

const Transport = nodemailer.createTransport({
    host:"suraj@gmail.com",
    port:587,
    secure: false,
    auth:{
        user: "suraj@gmail.com",
        pass: "ysql crby oohj fufv"
    }
})

const sendmail = async (email,html,subject,otp) =>{
    try {
        const gmail = await Transport.sendMail({
            from:"",
            to:email,
            text: otp,
            html:html,
            subject:subject
        })
        console.log(gmail);
    } catch (error) {
        console.log(error);
    }
}

module.exports = sendmail