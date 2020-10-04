var mongodb = require('mongodb')
var mongodClient = mongodb.MongoClient;
var url = "mongodb+srv://sid10on10:qwerty123@cluster0.fqer8.mongodb.net/ecommerce?retryWrites=true&w=majority";


module.exports = {url,mongodClient}