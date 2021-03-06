const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
const mongoURL = 'mongodb://127.0.0.1:27017/smartmirror';
const responseMessages = require('../responseMessages');

const funcall = module.exports = {
    uploadWunderlistSettings: function (settings, userId) {
        return new Promise((resolve, reject) => {
            let todo_list = settings.todoList;
            let client_secret = settings.wl_access_token;
            let client_id = settings.wl_client_id;

            // Check for empty or blank entries
            if (todo_list.trim().length !== 0 && client_secret.trim().length !== 0 && client_id.trim().length !== 0 && todo_list !== null && client_secret !== null && client_id !== null) {
                // Check if has already settings
                MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
                    if (err) resolve(JSON.stringify({
                        status: false,
                        message: responseMessages.DATABASE_CONNECTION_ERROR,
                        error: err
                    }));
                    else {
                        let db = client.db('smartmirror');
                        db.collection('wunderlist').findOne({"userId": new ObjectId(userId)}, (err, docs) => {
                            if (err) resolve(JSON.stringify({
                                status: false,
                                message: responseMessages.DATABASE_COLLECTION_FIND_ERROR,
                                error: err
                            }));
                            if (docs) {
                                // UPDATE current settings
                                db.collection("wunderlist").updateOne({"userId": new ObjectId(userId)},
                                    {
                                        $set: {todo_list: todo_list, client_secret: client_secret, client_id: client_id}
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
                                db.collection('wunderlist').insertOne({
                                    "userId": new ObjectId(userId),
                                    "todo_list": todo_list,
                                    "client_secret": client_secret,
                                    "client_id": client_id
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
                    message: responseMessages.WUNDERLIST_DATA_INVALID
                }));
            }
        });
    },

    //----------------------Get Wunderlist settings from current user----------------------//
    getWunderlistSettings: function (userId) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
                if (err) resolve(JSON.stringify({
                    status: false,
                    message: responseMessages.DATABASE_CONNECTION_ERROR,
                    error: err
                }));
                else {
                    let db = client.db('smartmirror');

                    client.db('smartmirror').collection('wunderlist').findOne({"userId": new ObjectId(userId)}, (err, res_find_wunderlist_settings) => {
                        if (err) {
                            client.close();
                            throw err;
                        } else {
                            client.close();
                            resolve(JSON.stringify({
                                status: true,
                                settings: res_find_wunderlist_settings,
                                message: responseMessages.DATABASE_COLLECTION_AGGREGATE_SUCCESS
                            }));
                        }
                    });
                }
            });
        });
    },

    sendCredentials: function (userId) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongoURL, {useNewUrlParser: true}, function (err, client) {
                if (err) {
                    console.log('Unable to connect to MongoDB');
                } else {
                    client.db('smartmirror').collection('users').findOne({"_id": new ObjectId(userId)}, (err, res_find_user) => {
                        if (err) {
                            client.close();
                            throw err;
                        } else {
                            let userId = res_find_user._id;
                            client.db('smartmirror').collection('wunderlist').findOne({"userId": new ObjectId(userId)}, (err, res_find_wunderlist_settings) => {
                                if (err) {
                                    client.close();
                                    throw err;
                                } else {
                                    client.close();
                                    resolve(res_find_wunderlist_settings);
                                }
                            });
                        }
                    });
                }
            });
        });
    }

}
