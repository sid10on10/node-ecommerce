var express = require('express');
var router = express.Router();
var mongodb = require("mongodb")
var {url,mongodClient} = require("../config")
const { sendEmail } = require('../common/mailer');
const bcryptjs = require("bcryptjs");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Pathshala E-commerce' });
});

router.post('/forgot_password', async function(req, res, next) {
  let client;
  try{
    client = await mongodClient.connect(url)
    let db = client.db("ecommerce")
    let user = await db.collection("users").findOne({email:req.body.email})
    if(user){
      let userId = user._id
      let email = req.body.email
      let reset_string = Math.random().toString(36).substr(2, 5);
      await db.collection("users").findOneAndUpdate({email:req.body.email},{$set:{reset_token:reset_string}})
      let reset_url  = `https://pathshala-ecommerce.herokuapp.com/reset/${userId}/${reset_string}`
      let mail_data = `Click here to reset your password ${reset_url}`
      let mail = await sendEmail(email, 'Password Reset Link', mail_data);
      console.log(mail)
      res.json({
        message:"Email Sent"
      })
    }else{
      res.status(404).json({
        message:"No user exist with this email."
      })
      client.close()
      res.end()
    }
  }catch(error){
    client.close()
    console.log(error)
  }
});

router.get('/reset/:userid/:reset_string', async function(req, res, next) {
  let client;
  try{
    client = await mongodClient.connect(url)
    let db = client.db("ecommerce")
    let user = await db.collection("users").findOne({_id:mongodb.ObjectId(req.params.userid)})
    if(user){
      let userEmail = user.email
      if(user.reset_token==req.params.reset_string){
        //res.write("<h1>You can Reset</h1>")
        res.render('reset',{email:userEmail})
        res.end()
        client.close()
      }else{
        client.close()
        res.status(404).json({
          message:"Invalid URL"
        })
      }
    }else{
      client.close()
      res.status(404).json({
        message:"Invalid URL"
      })
    }
    
    }catch(error){
      client.close()
      console.log(error)
  }
});

router.post('/reset_password', async function(req, res, next) {
  let client;
  try{
    client = await mongodClient.connect(url)
    let db = client.db("ecommerce")
    let {email,password} = req.body
    let user = await db.collection("users").findOne({email:email})
    let salt = await bcryptjs.genSalt(10)
    let hash = await bcryptjs.hash(password,salt)
    password = hash
    let setpass = await db.collection("users").updateOne({email},{$set:{password}})
    let remove_token = await db.collection("users").updateOne({email},{$unset:{reset_token:1}})
    res.json({
      message:"Password reset complete"
    })
  }catch(error){
    client.close()
    console.log(error)
  }
});


module.exports = router;
