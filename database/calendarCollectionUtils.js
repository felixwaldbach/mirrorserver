const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
const mongoURL = 'mongodb://127.0.0.1:27017/smartmirror';
const responseMessages = require('../responseMessages');

const funcall = module.exports = {

    uploadCalendarSettings(settings, userId)  {
        return new Promise((resolve, reject) => {
            let calendarICS = settings.calendarICS;

            // Check for empty or blank entries
            if (calendarICS.trim().length !== 0 && calendarICS !== null) {
                // Check if has already settings
                MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
                    if (err) resolve(JSON.stringify({
                        status: false,
                        message: responseMessages.DATABASE_CONNECTION_ERROR,
                        error: err
                    }));
                    else {
                        let db = client.db('smartmirror');
                        db.collection('calendar').findOne({"userId": new ObjectId(userId)}, (err, docs) => {
                            if (err) resolve(JSON.stringify({
                                status: false,
                                message: responseMessages.DATABASE_COLLECTION_FIND_ERROR,
                                error: err
                            }));
                            if (docs) {
                                // UPDATE current settings
                                db.collection("calendar").updateOne({"userId": new ObjectId(userId)},
                                    {
                                        $set: {calendarICS: calendarICS}
                                    }, (err, response) => {
                                        if (err) {
                                            client.close();
                                            resolve(JSON.stringify({
                                                status: false,
                                                message: responseMessages.DATABASE_COLLECTION_UPDATE_ERROR,
                                                error: err
                                            }));
                                        } else {
                                            if (response.result.ok === 1) {
                                                client.close();
                                                resolve(JSON.stringify({
                                                    status: true,
                                                    message: responseMessages.DATABASE_COLLECTION_UPDATE_SUCCESS
                                                }));
                                            } else {
                                                client.close();
                                                resolve(JSON.stringify({
                                                    status: false,
                                                    message: responseMessages.DATABASE_COLLECTION_UPDATE_ERROR
                                                }));
                                            }
                                        }
                                    });
                            } else {
                                // Add new entry
                                db.collection('calendar').insertOne({
                                    "userId": new ObjectId(userId),
                                    "calendarICS": calendarICS
                                }, function (err, result) {
                                    if (err) {
                                        client.close();
                                        resolve(JSON.stringify({
                                            status: false,
                                            message: responseMessages.DATABASE_COLLECTION_INSERT_ERROR
                                        }));
                                    } else {
                                        client.close();
                                        resolve(JSON.stringify({
                                            status: true,
                                            message: responseMessages.DATABASE_COLLECTION_INSERT_SUCCESS
                                        }));
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                resolve(JSON.stringify({
                    status: false,
                    message: responseMessages.CALENDAR_DATA_INVALID
                }));
            }
        });
    },

    getCalenderSettings: function (userId) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongoURL, {useNewUrlParser: true}, function (err, client) {
                if (err) {
                    console.log('Unable to connect to MongoDB');
                } else {
                    client.db('smartmirror').collection('calendar').findOne({"userId": new ObjectId(userId)}, (err, res_find_calendar_settings) => {
                        if (err) {
                            client.close();
                            throw err;
                        } else {
                            client.close();
                            resolve(JSON.stringify({
                                status: true,
                                settings: res_find_calendar_settings,
                                message: responseMessages.DATABASE_COLLECTION_AGGREGATE_SUCCESS
                            }));
                        }
                    });
                }
            });
        });
    },

    sendCalendar: function (userId) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongoURL, {useNewUrlParser: true}, function (err, client) {
                if (err) {
                    console.log('Unable to connect to MongoDB');
                } else {
                    client.db('smartmirror').collection('calendar').findOne({"userId": new ObjectId(userId)}, (err, res_find_calendar_settings) => {
                        if (err) {
                            client.close();
                            throw err;
                        } else {
                            client.close();
                            resolve(JSON.stringify({
                                status: true,
                                settings: res_find_calendar_settings,
                                message: responseMessages.DATABASE_COLLECTION_AGGREGATE_SUCCESS
                            }));
                        }
                    });
                }
            });
        });
    },

}
