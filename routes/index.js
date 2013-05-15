
/*
 * GET home page.
 */
// import database
var mongo = require('mongodb');
 
//create database server
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});

// create cartdb Database
db = new Db('cartdb', server);

// open database 
db.open(function(err, db) {
    if(!err) {
        db.collection('cart', {safe:true}, function(err, collection) {
            if (err) {
                //populateDB();
            }
        });
    }
});