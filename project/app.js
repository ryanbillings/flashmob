
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');
  
var flash = require("connect-flash");
var passport = require('passport');
var PassportLocalStrategy = require('passport-local').Strategy;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.cookieParser());
  app.use(express.session({ secret: '67328' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
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

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(id, done) {
  MongoClient.connect("mongodb://localhost:27017/flashmob", function(err, db) {
      var collection = db.collection('user');
      collection.findOne({username : id}, function (err, user) {
        db.close();
        done(err, user);
      });
  });
});

// Passport config
passport.use(new PassportLocalStrategy(
  function(username, password, done) {
    MongoClient.connect("mongodb://localhost:27017/flashmob", function(err, db) {
        var collection = db.collection('user');
        collection.findOne({ username: username }, function(err, user) {
          if (err) { return done(err); }
          if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
          }
          if (!user.password == password) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          return done(null, user);
        });
        db.close();
    });
  }
));

app.get('/login',routes.login);
app.get('/logout',routes.logout);
app.get('/signup',routes.signup);
app.post('/signup',routes.createUser);
app.get('/', routes.index);
app.get('/events',routes.events);
app.get('/event/:id',routes.showEvent);
app.get('/createEvent',routes.eventForm);
app.get('/submitEvent',routes.createEvent);
app.get('/joinevent',routes.joinEvent);
app.get('/profile', routes.profile);
app.get('/updatelocation', routes.location);
app.get('/refreshevents/:radius', routes.refreshEvents);
app.post('/login', passport.authenticate('local'),
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
