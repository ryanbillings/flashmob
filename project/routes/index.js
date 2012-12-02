var MongoClient = require('mongodb').MongoClient;
var geocoder = require('geocoder');

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
    // Connect to Mongo
   MongoClient.connect("mongodb://localhost:27017/flashmob", function(err, db) {
        if(err) { return console.dir(err); }
        var collection = db.collection('event'); 
        // Get the events
        collection.find().toArray(function(err,items){
           db.close();
           res.render('events', { allEvents:items });
        });
    });
};

exports.eventForm = function (req, res){
    res.render('eventform');
};

exports.createEvent = function(req,res){
    MongoClient.connect("mongodb://localhost:27017/flashmob", function(err, db) {
    if(err) { return console.dir(err); }
        var collection = db.collection('event');
        var newEvent = 
        { 
            "name" : req.param("name",null),
            "start_time" : new Date(),
            "end_time" : new Date(),
            "users" : [req.param("username",null)],
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