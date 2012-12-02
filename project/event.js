var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

Event = function(host, port) {
  this.db= new Db('flashmob', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};


Event.prototype.getCollection= function(callback) {
  this.db.collection('events', function(error, event_collection) {
    if( error ) callback(error);
    else callback(null, event_collection);
  });
};

Event.prototype.findAll = function(callback) {
    this.getCollection(function(error, event_collection) {
      if( error ) callback(error)
      else {
        event_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};


Event.prototype.findById = function(id, callback) {
    this.getCollection(function(error, event_collection) {
      if( error ) callback(error)
      else {
        event_collection.findOne({_id: event_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

Event.prototype.save = function(events, callback) {
    this.getCollection(function(error, event_collection) {
      if( error ) callback(error)
      else {
        if( typeof(events.length)=="undefined")
          events = [events];
          
        event_collection.insert(events, function() {
          callback(null, event);
        });
      }
    });
};

exports.Event = Event;