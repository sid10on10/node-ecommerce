const nodemailer = require("nodemailer")

let sendEmail = function(email,subject,payload){
try{
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MailUser,
      pass: process.env.MailPass
    }
  });
  
  var mailOptions = {
    from: 'sid10on10@gmail.com',
    to: email,
    subject: subject,
    text: payload
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}catch(error){
    console.log(error)
}
}


module.exports = {sendEmail}