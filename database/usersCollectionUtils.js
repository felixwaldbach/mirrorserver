const jwt = require('jsonwebtoken');
const SHA256 = require('crypto-js/sha256');
const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
const mongoURL = 'mongodb://127.0.0.1:27017/smartmirror';
const userWidgetsCollectionUtils = require('./userWidgetsCollectionUtils');

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
                        message: "Database connection could not be established",
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
                                    message: "Something went wrong while connecting to the database",
                                    error: err
                                }));
                            }
                            if (docs) {
                                client.close();
                                resolve(JSON.stringify({
                                    status: false,
                                    message: "This username is not available. Please try another one."
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
                                            message: "Something went wrong registering this user. Please try again!",
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
                    message: "User data can't be empty."
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
                    message: "All fields are required."
                }));
            } else {
                // Check for blank fields
                if (username != null && password != null) {
                    MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
                        if (err) resolve(JSON.stringify({
                            status: false,
                            message: "Database connection could not be established",
                            error: err
                        }));
                        else {
                            let db = client.db('smartmirror');
                            db.collection('users').findOne({"username": username}, (err, docs) => {
                                if (err) {
                                    client.close();
                                    resolve(JSON.stringify({
                                        status: false,
                                        message: "Sorry, your password is incorrect. Please check again!",
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
                                                message: "Correct credentials",
                                            }));
                                        });
                                    } else {
                                        client.close();
                                        resolve(JSON.stringify({
                                            status: false,
                                            message: "Sorry, your password is incorrect. Please check again."
                                        }));
                                    }
                                } else {
                                    client.close();
                                    resolve(JSON.stringify({
                                        status: false,
                                        message: "Sorry, your password is incorrect. Please check again."
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
                    message: "Database connection could not be established",
                    error: err
                }));
                else {
                    jwt.verify(token, secretkey, (err, authData) => {
                        if (err) {
                            resolve(JSON.stringify({
                                status: false,
                                message: "Error during authentication",
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
                                        message: "User not found",
                                        error: err
                                    }));
                                }
                                if (res_find_user) {
                                    client.close();
                                    resolve(JSON.stringify({
                                        status: true,
                                        userid: userid,
                                        username: res_find_user.username,
                                        face_image: res_find_user.face_image
                                    }));
                                } else {
                                    client.close();
                                    resolve(JSON.stringify({
                                        status: false,
                                        message: "User not found"
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
                    message: "Database connection could not be established",
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
                                    message: "Error during update",
                                    error: err
                                }));
                            } else {
                                if (response.result.ok === 1) {
                                    client.close();
                                    resolve(JSON.stringify({
                                        status: true,
                                        message: "Image uploaded successfully!"
                                    }));
                                } else {
                                    client.close();
                                    resolve(JSON.stringify({
                                        status: false,
                                        message: "Updating image failed. Please try again!"
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