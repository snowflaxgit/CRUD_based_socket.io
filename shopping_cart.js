/**
 * Module dependencies.
 */
var result;

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

var mongo = require('mongodb');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

// all environments
app.set('port', process.env.PORT || 3560);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

 var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));  
});

var io = require('socket.io').listen(server, { log: false });

app.get('/', function(req, res){
	db.collection('cart', function(err, collection) {
        collection.find().toArray(function(err, i) {
			result = i;
			res.render('index', {items : i, error:''} );	//get all data from db and render on index page	
        });
    });
});

<!-- start socketio connection -->

io.sockets.on('connection', function (socket) {	

	<!-- insertion function   -->
	app.post('/add', function(req, res){ 
		
		var things = req.body;
		
		var name = req.param('name', null);
		var price = req.param('price', null);
		var qty = req.param('qty', null);
			
		var letters = /^[A-Za-z]+$/;  
		var numbers = /^[0-9]+$/;	
	
		if(name.match(letters) && name.length <=15 && price.match(numbers) && price.length <=5 && qty.match(numbers) && qty.length <=3)  
		{
			<!-- add item into db. -->
			db.collection('cart', function(err, collection) {
				collection.insert(things, function(err, result) {	// insert item into db
					if (err) {
						res.send({'error':'An error has occurred'});
					}
					socket.broadcast.emit('item',{msg : result});	// broadcast item.
					console.log("1 row inserted.");
					res.send(200);				
				});
			});
		}  
		else  
		{
			// give response if validation is not fulfill.
			res.send(false);
		}
	});
	
	<!-- deletion function -->
	app.get('/:id', function(req, res){
		  var id = req.params.id;
		  
		  <!-- remove item from db -->  
		  db.collection('cart', function(err, collection) {
			collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) { // remove item
				if (err) {
					res.send({'error':'An error has occurred - ' + err});
				} else {
					console.log('' + result + ' row deleted');
					socket.broadcast.emit('id',{id : id}); // broadcast id 
					res.send(200);				
				}
			});
		});
	});
	
	<!-- update function -->
	app.post('/edit/:id', function(req, res){
		var things = req.body;
		var id = req.body.hide;
		
		var name = req.body.name;
		var price = req.body.price;
		var qty = req.body.qty;
		var letters = /^[A-Za-z]+$/;  
		var numbers = /^[0-9]+$/;
		
		if(name.match(letters) && name.length <=15 && price.match(numbers) && price.length <=5 && qty.match(numbers) && qty.length <=3)  
		{
			<!-- update item from db -->
			db.collection('cart', function(err, collection) {
				collection.update({'_id':new BSON.ObjectID(id)}, things, {safe:true}, function(err, result) {
					if (err) {
						res.send({'error':'An error has occurred'});
					} else {
						console.log('' + result + ' document(s) updated');					
						collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
							socket.broadcast.emit('update',{ item : [item]}); // broadcast updated item.
							res.send(200);				
						});					
					}
				});
			});
		}  
		else  
		{		
			// give response if validation is not fulfill.
			res.send(false);
		}
	});

});
