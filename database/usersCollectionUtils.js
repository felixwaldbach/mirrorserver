const jwt = require('jsonwebtoken');
const SHA256 = require('crypto-js/sha256');
const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
const mongoURL = 'mongodb://127.0.0.1:27017/smartmirror';
const userWidgetsCollectionUtils = require('./userWidgetsCollectionUtils');
const responseMessages = require('../responseMessages');

const funcall = module.exports = {
    //----------------------Register user----------------------//
    registerUser: function (newUserData) {
        return new Promise((resolve, reject) => {

            let username = newUserData.username;
            let password = newUserData.password;

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
                                    "face_image": ""
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
                                        let userWidgetsResponse = await userWidgetsCollectionUtils.createDocument(newUserData.username);
                                        resolve(userWidgetsResponse);
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

    signInUser: function (userData) {
        return new Promise((resolve, reject) => {

            let username = userData.username;
            let password = userData.password;

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
                                            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 60 * 60 * 24),
                                            userid: docs._id,
                                            username: docs.username
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
    getUserDataForCurrentUser: function (token, secretkey) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
                if (err) resolve(JSON.stringify({
                    status: false,
                    message: responseMessages.DATABASE_CONNECTION_ERROR,
                    error: err
                }));
                else {
                    jwt.verify(token, secretkey, (err, authData) => {
                        if (err) {
                            resolve(JSON.stringify({
                                status: false,
                                message: responseMessages.USER_NOT_AUTHORIZED,
                                error: err
                            }));
                        } else {
                            const userid = authData.userid;
                            // Return logged in user information with token of jwt
                            let db = client.db('smartmirror');
                            db.collection('users').findOne({"_id": new ObjectId(userid)}, (err, res_find_user) => {
                                if (err) {
                                    client.close();
                                    resolve(JSON.stringify({
                                        message: responseMessages.USER_DATA_INVALID,
                                        error: err
                                    }));
                                }
                                if (res_find_user) {
                                    client.close();
                                    resolve(JSON.stringify({
                                        status: true,
                                        userid: userid,
                                        username: res_find_user.username,
                                        face_image: res_find_user.face_image,
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
                    });
                }
            });
        });
    },

    //----------------------Update user face image----------------------//
    uploadImageToServer: function (fileData, userId) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
                if (err) resolve(JSON.stringify({
                    status: false,
                    message: responseMessages.DATABASE_CONNECTION_ERROR,
                    error: err
                }));
                else {
                    let db = client.db('smartmirror');
                    db.collection("users").updateOne({_id: new ObjectId(userId)},
                        {
                            $set: {face_image: fileData.filename}
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
                                        message: responseMessages.IMAGE_UPLOAD_SUCCESS
                                    }));
                                } else {
                                    client.close();
                                    resolve(JSON.stringify({
                                        status: false,
                                        message: responseMessages.IMAGE_UPLOAD_ERROR
                                    }));
                                }
                            }
                        }
                    );
                }
            })
        });
    }
}