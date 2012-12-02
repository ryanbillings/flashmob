
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// Retrieve
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/flashmob", function(err, db) {
  if(err) { return console.dir(err); }
  db.createCollection('event', function(err, collection) {});
  db.createCollection('user', function(err, collection) {});
  db.close();
});

app.get('/login',routes.login);
app.get('/', routes.index);
app.get('/events',routes.events);
app.get('/event/:id',routes.showEvent);
app.get('/createEvent',routes.eventForm);
app.post('/createEvent',routes.createEvent);
app.get('/profile', routes.profile);
app.post('/updatelocation', routes.location);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
