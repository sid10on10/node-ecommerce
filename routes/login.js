var express = require('express');
var router = express.Router();
var {url,mongodClient} = require("../config")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")


router.post('/', async function(req, res, next) {
    let client;
    try{
        client = await mongodClient.connect(url)
        let db = client.db("ecommerce")
        
        let user = await db.collection("users").findOne({email:req.body.email})
        //console.log(user)
        if(user){
            let result  = await bcryptjs.compare(req.body.password,user.password)
            if(result){
                let token = jwt.sign({id:user._id},"abcdefghijklmnopqrs")
                res.json({
                    message:"Login Successfull",
                    token
                })
            }else{
                res.json({
                    message:"Password Incorrect"
                })
            }
        }else{
            res.json({
                message:"No User Found with the Email"
            })
            client.close()
        }
        client.close()
        
        res.end()
    }catch(error){
        client.close()
        console.log(error)
    }
});

module.exports = router;
