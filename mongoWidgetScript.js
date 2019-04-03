const mongoClient = require('mongodb').MongoClient;
const mongoURL = "mongodb://localhost:27017";
const dbName = 'smartmirror'
const collectionName = 'widgets'
const async = require('async');

const myDocs = [
    {"name": "ClockWidget"},
    {"name": "NewsFeed"},
    {"name": "QuotesWidget"},
    {"name": "ToDoWidget"},
    {"name": "WeatherWidget"},
    {"name": "CalendarWidget"}
];

//mongo DB insertion (using async series)
async.waterfall([
        //function array...
        function (callback) {
            //database connect
            console.log("DB Connect");
            mongoClient.connect(mongoURL, function (err, mgo) {
                if (err) callback(err, mgo);
                callback(null, mgo);
            });
        },
        function (mgo, callback) {
            //list collections
            console.log("List Collections");
            var db = mgo.db(dbName);
            var names = [];
            db.listCollections().toArray(function (err, collinfo) {
                if (err) callback(err, mgo);
                for (coll in collinfo) {
                    names.push(collinfo[coll].name);
                    console.log(collinfo[coll].name);
                }
                callback(null, mgo, names);
            });
        },
        function (mgo, names, callback) {
            //drop collection (if pre-existing)
            console.log("Collection '" + collectionName + "'");
            var db = mgo.db(dbName);
            if (names.includes(collectionName)) {
                db.dropCollection(collectionName, function (err, res) {
                    if (err) callback(err, mgo);
                    console.log("dropped");
                    callback(null, mgo);
                });
            } else {
                console.log("not found");
                callback(null, mgo);
            }
        },
        function (mgo, callback) {
            //create collection
            console.log("Create Collection 'deviceApps'");
            var db = mgo.db(dbName);
            db.createCollection(collectionName, function (err, coll) {
                if (err) callback(err, mgo);
                callback(null, mgo, coll);
            });
        },
        function (mgo, coll, callback) {
            //insert documents
            console.log("Insert Documents");
            coll.insertMany(myDocs, function (err, res) {
                if (err) callback(err, mgo);
                callback(null, mgo);
            });
        },
        function (mgo, callback) {
            //close connection
            console.log("DB close");
            try {
                mgo.close();
                callback(null, null);
            } catch (err) {
                callback(err, mgo);
            }
        }],
    //post array function
    function (err, mgo) {
        //db close, error logging
        if (mgo) mgo.close();
        if (err) console.log(err);
        else console.log("Done without Errors");
    }
);

