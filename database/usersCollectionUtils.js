const jwt = require('jsonwebtoken');
const SHA256 = require('crypto-js/sha256');
const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
const mongoURL = 'mongodb://127.0.0.1:27017/smartmirror';
const responseMessages = require('../responseMessages');

const funcall = module.exports = {
    //----------------------Register user----------------------//
    registerUser: function (username, password) {
        return new Promise((resolve, reject) => {

            // Check for empty or blank entries
            if (username.trim().length !== 0 && password.trim().length !== 0 && username !== null && password !== null) {
                MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
                    if (err) resolve(JSON.stringify({
                        status: false,
                        message: responseMessages.DATABASE_CONNECTION_ERROR,
                        error: err
                    }));
                    else {
                        // Check is username is taken
                        let db = client.db('smartmirror');
                        db.collection('users').findOne({"username": username}, (err, docs) => {
                            if (err) {
                                client.close();
                                resolve(JSON.stringify({
                                    status: false,
                                    message: responseMessages.DATABASE_COLLECTION_FIND_ERROR,
                                    error: err
                                }));
                            }
                            if (docs) {
                                client.close();
                                resolve(JSON.stringify({
                                    status: false,
                                    message: responseMessages.USER_DATA_INVALID
                                }));
                            } else {
                                // Add new user to database with hashed password
                                db.collection('users').insertOne({
                                    "username": username,
                                    "password": SHA256(password).words,
                                    "widgets": new Array(8)
                                }, async function (err, res) {
                                    if (err) {
                                        client.close();
                                        resolve(JSON.stringify({
                                            status: false,
                                            message: responseMessages.USER_REGISTRATION_ERROR,
                                            error: err
                                        }));
                                    } else {
                                        client.close();
                                        resolve(JSON.stringify({
                                            status: true,
                                            message: responseMessages.USER_DATA_SUCCESS
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
                    message: responseMessages.USER_DATA_INVALID
                }));
            }
        });
    },

    signInUser: function (username, password) {
        return new Promise((resolve, reject) => {
            // Check for empty fields
            if (!username.trim() || !password) {
                resolve(JSON.stringify({
                    status: false,
                    message: responseMessages.USER_DATA_INVALID
                }));
            } else {
                // Check for blank fields
                if (username != null && password != null) {
                    MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
                        if (err) resolve(JSON.stringify({
                            status: false,
                            message: responseMessages.DATABASE_CONNECTION_ERROR,
                            error: err
                        }));
                        else {
                            let db = client.db('smartmirror');
                            db.collection('users').findOne({"username": username}, (err, docs) => {
                                if (err) {
                                    client.close();
                                    resolve(JSON.stringify({
                                        status: false,
                                        message: responseMessages.USER_DATA_INVALID,
                                        error: err
                                    }));
                                }
                                if (docs) {
                                    // Check if account password of username is right
                                    if (JSON.stringify(SHA256(password).words) === JSON.stringify(docs.password)) {
                                        jwt.sign({
                                            userId: docs._id
                                        }, process.env.secretkey, (err, token) => {
                                            client.close();
                                            resolve(JSON.stringify({
                                                status: true,
                                                token: token,
                                                message: responseMessages.USER_DATA_SUCCESS,
                                            }));
                                        });
                                    } else {
                                        client.close();
                                        resolve(JSON.stringify({
                                            status: false,
                                            message: responseMessages.USER_DATA_INVALID
                                        }));
                                    }
                                } else {
                                    client.close();
                                    resolve(JSON.stringify({
                                        status: false,
                                        message: responseMessages.USER_DATA_INVALID
                                    }));
                                }
                            });
                        }
                    });
                }
            }
        });
    },


    //----------------------Get Current User----------------------//
    getUserData: function (userId) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
                if (err) resolve(JSON.stringify({
                    status: false,
                    message: responseMessages.DATABASE_CONNECTION_ERROR,
                    error: err
                }));
                else {
                    let db = client.db('smartmirror');
                    db.collection('users').findOne({"_id": new ObjectId(userId)}, (err, res) => {
                        if (err) {
                            client.close();
                            resolve(JSON.stringify({
                                message: responseMessages.USER_DATA_INVALID,
                                error: err
                            }));
                        }
                        if (res) {
                            client.close();
                            resolve(JSON.stringify({
                                status: true,
                                user_data: res,
                                message: responseMessages.USER_DATA_SUCCESS
                            }));
                        } else {
                            client.close();
                            resolve(JSON.stringify({
                                status: false,
                                message: responseMessages.USER_DATA_INVALID
                            }));
                        }
                    })
                }
            })
        })
    },


    //----------------------Set User Widget ids----------------------//
    updateUserWidgets: async function (userId, widgetName, previousSlot, slot) {
        return new Promise(async (resolve, reject) => {
            let entry = await this.getUserData(userId);
            let widgets = JSON.parse(entry).user_data.widgets;
            if (previousSlot >= 0) {
                widgets[previousSlot] = null;
            }
            if (slot >= 0) {
                widgets[slot] = {
                    name: widgetName
                };
            }
            MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
                if (err) resolve(JSON.stringify({
                    status: false,
                    message: responseMessages.DATABASE_CONNECTION_ERROR,
                    error: err
                }));
                else {
                    let db = client.db('smartmirror');
                    await db.collection('users').updateOne({"_id": new ObjectId(userId)}, {$set: {widgets: widgets}}, (err, result) => {
                        if (err) resolve(JSON.stringify({
                            status: false,
                            message: responseMessages.DATABASE_COLLECTION_UPDATE_ERROR,
                            error: err
                        }));
                        else {
                            client.close();
                            resolve(JSON.stringify({
                                status: true,
                                message: responseMessages.DATABASE_COLLECTION_UPDATE_SUCCESS
                            }));
                        }
                    });
                }
            });
        });
    }
}
