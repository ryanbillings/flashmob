var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var geocoder = require('geocoder');
var BSON = mongo.BSONPure;


// GET Login
exports.login = function(req,res){
    res.render('login', { message : req.flash("error")});
};

exports.logout = function(req,res){
    req.logout();
    res.redirect('login');
};

// GET Signup
exports.signup = function(req,res){
    res.render('signup', { message : req.flash("error")});
};

exports.createUser = function(req,res){
    MongoClient.connect("mongodb://localhost:27017/flashmob", function(err, db) {
    if(err) { return console.dir(err); }
        var collection = db.collection('user');
        var newUser = 
        { 
            "username" : req.param("username"),
            "password" : req.param("password")
        };
        collection.findOne({"username":newUser.uesrname},function(err,item){
            if(!item){
                collection.insert(newUser, function(){
                    db.close();
                    res.redirect('/events');
                });
            }else{
                db.close();
                res.render('signup', { message : "Username already Chosen"});
            }
        });
    });
};
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

/* GET Events Page
 *
 */
exports.events = function(req,res){
    if(req.user && req.user.username){
        // Connect to Mongo
        MongoClient.connect("mongodb://localhost:27017/flashmob", function(err, db) {
            if(err) { return console.dir(err); }
            var collection = db.collection('event'); 
            // Get the events
            collection.find().toArray(function(err,items){
               db.close();
               res.render('events', { allEvents:items,user:req.user.username });
            });
        });
    }else{
        res.redirect('/login');
    }
};

// Show an Event
exports.showEvent = function(req,res){
    if(req.user && req.user.username){
    MongoClient.connect("mongodb://localhost:27017/flashmob", function(err, db) {
        if(err) { return console.dir(err); }
        var collection = db.collection('event');
        var o_id = new BSON.ObjectID(req.param("id"));
        // Get the events
        collection.findOne({_id : o_id},function(err,result){
               db.close();
               res.render('event', { event:result });
        });
    });
    }else{
        res.redirect('/login');
    }
};

exports.joinEvent = function (req,res){
    console.log('here');
    var username = req.user.username; 
    MongoClient.connect("mongodb://localhost:27017/flashmob", function(err, db) {
    if(err) { return console.dir(err); }
        var collection = db.collection('event');
        var o_id = new BSON.ObjectID(req.param("eventid"));
        collection.findOne({_id : o_id},function(err,event){
            var userList = event.users;
            console.log(userList);
            if(userList.indexOf(username) == -1){
                collection.update({_id:o_id},
                                {"$push":{users:username}},
                                function(error, user){
                                    db.close();
                                    res.redirect("/event/"+req.param("eventid"));
                                });
            }else{
                db.close();
                res.redirect("/event/"+req.param("eventid"));
            }
        });
    });
};

// Form to create Event
exports.eventForm = function (req, res){
    res.render('eventform');
};

// Post Method on Form Submit
exports.createEvent = function(req,res){
    MongoClient.connect("mongodb://localhost:27017/flashmob", function(err, db) {
    if(err) { return console.dir(err); }
        var collection = db.collection('event');
        var newEvent = 
        { 
            "name" : req.param("name",null),
            "start_time" : new Date(),
            "end_time" : new Date(),
            "users" : [req.user.username],
            "address" : req.param("address",null),
            "city" : req.param("city",null),
            "zipcode" : req.param("zipcode"),
            "state" : req.param("state"),
            "description" : req.param("description")
        };
        var concatAddress = newEvent.address + "," + newEvent.city + "," + newEvent.state;
        geocoder.geocode(concatAddress,function(err,data){
            newEvent.latitude = data.results[0].geometry.location.lat;
            newEvent.longitude = data.results[0].geometry.location.lng;
            collection.insert(newEvent, function(){
                db.close();
                res.redirect('/events');
            });
        });
    });
    
}