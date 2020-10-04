var mongodb = require('mongodb')
var mongodClient = mongodb.MongoClient;
var url = "mongodb://sid:sid@localhost:27017";


module.exports = {url,mongodClient}