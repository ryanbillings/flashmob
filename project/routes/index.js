var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var geocoder = require('geocoder');
var BSON = mongo.BSONPure;

/** Converts numeric degrees to radians */
if(typeof(Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    }
}

// GET Login
exports.login = function(req,res){
    if(req.user && req.user.username){
        res.redirect('/');
    }else{
        res.render('login', { message : req.flash("error")});
    }
};

exports.logout = function(req,res){
    req.logout();
    res.redirect('login');
};

// GET Signup
exports.signup = function(req,res){
    res.render('signup', { message : req.flash("error")});
};

exports.location = function(req,res){
    MongoClient.connect("mongodb://localhost:27017/flashmob", function(err, db) {
    if(err) { return console.dir(err); }
        var collection = db.collection('user');
        var newZip = req.param("newzip");
        geocoder.geocode(req.param("newzip"),function(err,data){
            var newLat = data.results[0].geometry.location.lat;
            var newLng = data.results[0].geometry.location.lng;
            collection.update({username:req.user.username},{"$set" : {latitude : newLat,longitude : newLng,zipcode: newZip}},function(err,item){
                db.close();
                res.redirect('/events');
            });
        });
    });
};

exports.createUser = function(req,res){
    MongoClient.connect("mongodb://localhost:27017/flashmob", function(err, db) {
    if(err) { return console.dir(err); }
        var collection = db.collection('user');
        var newUser = 
        { 
            "username" : req.param("username"),
            "firstname" : req.param("firstname"),
            "lastname" : req.param("lastname"),
            "zipcode" : req.param("zipcode"),
            "password" : req.param("password"),
            "events" : [],
            "messages" : []
        };
        geocoder.geocode(req.param("zipcode"),function(err,data){
            newUser.latitude = data.results[0].geometry.location.lat;
            newUser.longitude = data.results[0].geometry.location.lng;
            collection.findOne({username:newUser.username},function(err,item){
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
    });
};
/*
 * GET home page.
 */

exports.index = function(req, res){
  if(req.user && req.user.username){
    res.render('index', {"username":req.user.username});
  }else{
    res.redirect("/login");
  }
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
                var decimals = 2;
                var filteredItems = [];
                var earthRadius = 6371;
                for(var i = 0; i < items.length; i++){
                    var eventLat = items[i].latitude;
                    var eventLng = items[i].longitude;
                    var userLat = req.user.latitude;
                    var userLng = req.user.longitude;
                    var dLat = (userLat - eventLat).toRad();
                    var dLon = (userLng - eventLng).toRad();
                    var lat1 = userLat.toRad();
                    var lat2 = eventLat.toRad();
                     var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    var d = earthRadius * c;
                    if((Math.round(d * Math.pow(10, decimals)) / Math.pow(10, decimals)) < 10){
                        filteredItems.push(items[i]);
                    } 
                }
                res.render('events', { allEvents:filteredItems,user:req.user });
            });
        });
    }else{
        res.redirect('/login');
    }
};

exports.refreshEvents = function(req,res){
    var radius = parseInt(req.param("radius"));
    MongoClient.connect("mongodb://localhost:27017/flashmob", function(err, db) {
        if(err) { return console.dir(err); }
        var collection = db.collection('event'); 
        // Get the events
        collection.find().toArray(function(err,items){
            db.close();
            var decimals = 2;
            var filteredItems = [];
            var earthRadius = 6371;
            for(var i = 0; i < items.length; i++){
                var eventLat = items[i].latitude;
                var eventLng = items[i].longitude;
                var userLat = req.user.latitude;
                var userLng = req.user.longitude;
                var dLat = (userLat - eventLat).toRad();
                var dLon = (userLng - eventLng).toRad();
                var lat1 = userLat.toRad();
                var lat2 = eventLat.toRad();
                 var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = earthRadius * c;
                if((Math.round(d * Math.pow(10, decimals)) / Math.pow(10, decimals)) < radius){
                    filteredItems.push(items[i]);
                } 
            }
            res.send(filteredItems);
        });
    });
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
              var starttime = day_names[result.start_time.getDay()] + ", " + month_names[result.start_time.getMonth()] + " " + result.start_time.getDate() + ", " + result.start_time.getFullYear();
              var endtime = day_names[result.end_time.getDay()] + ", " + month_names[result.end_time.getMonth()] + " " + result.end_time.getDate() + ", " + result.end_time.getFullYear();
              res.render('event', { event:result, stime:starttime, etime:endtime, "username" : req.user.username });
        });
    });
    }else{
        res.redirect('/login');
    }
};

exports.joinEvent = function (req,res){
    var username = req.user.username; 
    MongoClient.connect("mongodb://localhost:27017/flashmob", function(err, db) {
    if(err) { return console.dir(err); }
        var ucollection = db.collection('user');
        var collection = db.collection('event');
        var o_id = new BSON.ObjectID(req.param("eventid"));
        collection.findOne({_id : o_id},function(err,event){
            var userList = event.users;
            if(userList.indexOf(username) == -1){
                collection.update({_id:o_id},
                                {"$push":{users:username}},
                                function(error, user){
                                    ucollection.update({username:req.user.username},
                                    {"$push":{events:event}},
                                    function(error, evt){
                                        db.close();
                                        res.redirect("/event/"+req.param("eventid"));
                                    });
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
    if(req.user && req.user.username){
        res.render('eventform', {"username":req.user.username});
    }else{
        res.redirect("/login");
    }
};

// Post Method on Form Submit
exports.createEvent = function(req,res){
    MongoClient.connect("mongodb://localhost:27017/flashmob", function(err, db) {
    if(err) { return console.dir(err); }
        var collection = db.collection('event');
        var current_date = new Date();
        var newEvent = 
        { 
            "name" : req.param("name",null),
            "start_time" : new Date(req.param("starttime", null)),
            "end_time" : new Date(req.param("endtime", null)),
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
                var userCollection = db.collection('user');
                userCollection.update({"username":req.user.username},
                                {"$push":{events:newEvent}},
                                function(error, user){
                                    db.close();
                                    res.redirect('/events');
                                });
            });
        });
    });
};

var month_names = new Array ( );
month_names[month_names.length] = "January";
month_names[month_names.length] = "February";
month_names[month_names.length] = "March";
month_names[month_names.length] = "April";
month_names[month_names.length] = "May";
month_names[month_names.length] = "June";
month_names[month_names.length] = "July";
month_names[month_names.length] = "August";
month_names[month_names.length] = "September";
month_names[month_names.length] = "October";
month_names[month_names.length] = "November";
month_names[month_names.length] = "December";

var day_names = new Array ( );
day_names[day_names.length] = "Sunday";
day_names[day_names.length] = "Monday";
day_names[day_names.length] = "Tuesday";
day_names[day_names.length] = "Wednesday";
day_names[day_names.length] = "Thursday";
day_names[day_names.length] = "Friday";
day_names[day_names.length] = "Saturday";

exports.createMessage = function(req,res){
    if(req.user && req.user.username){
        MongoClient.connect("mongodb://localhost:27017/flashmob", function(err, db) {
        console.log('hi');
        if(err) { return console.dir(err); }
            var collection = db.collection('event');
            var userCollection = db.collection('user');
            var o_id = new BSON.ObjectID(req.param("eventid"));
            var message = { "content" : req.param("content"),
                            "from" : req.user.username,
                            "created" : new Date()};
            collection.findOne({_id:o_id}, function(err,evt){
                for(var i = 0; i < evt.users.length; i++){
                    userCollection.update({username:evt.users[i]},
                                    {"$push":{messages:message}}, function(err, u){});
                }
            });
            res.send({"success":true});
        });
    }else{
        res.redirect("/login");
    }
};

exports.messageForm = function(req,res){
    if(req.user && req.user.username){
        res.render("messageform", {"username" : req.user.username});
    }else{
        res.redirect("/login");
    }
};

exports.messages = function(req,res){
    if(req.user && req.user.username){
        MongoClient.connect("mongodb://localhost:27017/flashmob", function(err, db) {
        if(err) { return console.dir(err); }
            var collection = db.collection('user');
            var uMessages = collection.find({username:req.user.username},{messages:1}).toArray(function(err,items){
                db.close();
                res.render("messages",{messages:items[0].messages.sort(dateCompare),"username" : req.user.username});
            });    
        });
    }else{
        res.redirect("/login");
    }
};

// Custom sort function for rendering dates
function dateCompare(a,b) {
  if (a.created < b.created)
     return -1;
  if (a.created > b.created)
    return 1;
  return 0;
}

exports.chat = function(req,res){
    if(req.user && req.user.username){
        res.render("chat",{"username":req.user.username});
    }else{
        res.redirect("/login");
    }
};

exports.account = function(req,res){
    if(req.user && req.user.username){
        MongoClient.connect("mongodb://localhost:27017/flashmob", function(err, db) {
        if(err) { return console.dir(err); }
            var collection = db.collection('user');
            collection.findOne({username:req.user.username},function(err,item){
                db.close();
                res.render("user",{"user" : item});
            });
        });
    }else{
        res.redirect("/login");
    }
};
