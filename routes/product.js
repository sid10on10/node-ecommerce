var express = require('express');
var router = express.Router();
var {url,mongodClient} = require("../config")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const mongodb = require("mongodb")
const {authenticate} = require('../common/auth');

router.get('/role',authenticate,async function(req,res){
    let client;
    try{
        client = await mongodClient.connect(url)
        let db = client.db("ecommerce")
        let token = req.headers.authorization
        let user = jwt.verify(token,"abcdefghijklmnopqrs")
        let userID = user.id
        let userData = await db.collection("users").findOne({_id:mongodb.ObjectId(userID)})
        let role = userData["role"]
        res.json({
            role
        })
    }catch(error){
        client.close()
        console.log(error)
    }
})


router.post('/addProducts',authenticate,async function(req,res,){
    let client;
    try{
        client = await mongodClient.connect(url)
        let db = client.db("ecommerce")
        let token = req.headers.authorization
        let user = jwt.verify(token,"abcdefghijklmnopqrs")
        let userID = user.id
        let userData = await db.collection("users").findOne({_id:mongodb.ObjectId(userID)})
        //console.log(user) --> { id: '5f78c71d1a26d9b62ffb1627', iat: 1601753723 }
        //role ---> "admin" console.log(userData["role"])
        if(userData["role"]=="admin"){
            let {productID,productName,productQty,productPrice} = req.body
            let product = await db.collection("products").findOne({productID})
            if(product){
                res.json({
                    message:"Product with this ID already exists"
                })
                client.close()
            }else{
                await db.collection("products").insertOne({productID,productName,productQty,productPrice})
                res.json({
                    message:"Product added Successfully."
                })
                client.close()
            }
        }else{
            res.status(403).json({
                message:"Only admins can use this endpoint."
            })
        }
    }catch(error){
        client.close()
        console.log(error)
    }
})

router.get('/products',authenticate,async function(req,res,){
    let client;
    try{
        client = await mongodClient.connect(url)
        let db = client.db("ecommerce")
        let token = req.headers.authorization
        let products = await db.collection("products").find().toArray()
        res.json({
            products 
        })
        client.close()
        
    }catch(error){
        client.close()
        console.log(error)
    }
})

router.get('/products/:productName',authenticate,async function(req,res,){
    let client;
    try{
        client = await mongodClient.connect(url)
        let db = client.db("ecommerce")
        let query = req.params.productName
        let products = await db.collection("products").find({$text:{$search:`\"${query}"`}}).toArray()
        if(products){
            res.json({
                products 
            })
            client.close()
        }else{
            res.json({
                message:"No products Found with this Name" 
            })
            client.close()
        }
    }catch(error){
        client.close()
        console.log(error)
    }
})

router.post('/productbuy',authenticate,async function(req,res,){
    let client;
    try{
        client = await mongodClient.connect(url)
        let db = client.db("ecommerce")
        let token = req.headers.authorization
        let user = jwt.verify(token,"abcdefghijklmnopqrs")
        let userID = user.id
        let userData = await db.collection("users").findOne({_id:mongodb.ObjectId(userID)})
        if(userData["role"]=="client"){
            let {productID,productQty} = req.body
            let product = await db.collection("products").findOne({productID})
            if(product){
                //console.log(product)
                if(productQty<=product["productQty"] && productQty>0){
                    // do logic
                    let newQty = product["productQty"] - productQty
                    let updateQty = await db.collection("products").findOneAndUpdate({productID},{$set:{productQty:newQty}})
                    let orderAmount = productQty*product["productPrice"]
                    let orderData = {productID,productQty,orderAmount}
                    let updateOrder = await db.collection("users").findOneAndUpdate({_id:mongodb.ObjectId(userID)},{$push:{orders:orderData}})
                    res.json({
                        message:"Order Successfull",
                    })
                }else{
                    res.json({
                        message:"Please enter valid quantity"
                    })
                    client.close()
                }
            }else{
                res.json({
                    message:"Please enter valid Product ID",
                })
                client.close()
            }
        }else{
            res.status(403).json({
                message:"Only Clients can buy products."
            })
            client.close()
        }
    }catch(error){
        client.close()
        console.log(error)
    }
})


router.get('/orders',authenticate,async function(req,res,){
    let client;
    try{
        client = await mongodClient.connect(url)
        let db = client.db("ecommerce")
        let token = req.headers.authorization
        let user = jwt.verify(token,"abcdefghijklmnopqrs")
        let userID = user.id
        let userData = await db.collection("users").findOne({_id:mongodb.ObjectId(userID)})
        if(userData["role"]=="client"){
            let orderData = userData["orders"]
            res.json(orderData)
            client.close()
        }else{
            res.json({
                message:"Only client can access orders."
            })
            client.close()
        }
        
    }catch(error){
        client.close()
        console.log(error)
    }
})


module.exports = router;
