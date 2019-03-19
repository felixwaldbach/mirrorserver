/**
 * Functions to access and change data inside the users collection of the database
 * Requests are sent to the backend by the React Frontend and the React Native Smartphone app and handled by the respective
 * route/message handler in the backend
 */

const jwt = require('jsonwebtoken');
const SHA256 = require('crypto-js/sha256');

const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
const mongoURL = 'mongodb://127.0.0.1:27017/smartmirror';

const responseMessages = require('../responseMessages');

/**
 * Function to insert a new document into the users collection
 * @param username: Provided username to save, password: provided password to save hashed
 * @returns {Promise<any>} Returns JSOB object with status, message and error message if applicable
 */
function registerUser(username, password) {
    return new Promise((resolve, reject) => {
        // Check if username or passsword is empty or blank
        if (username.trim().length !== 0 && password.trim().length !== 0 && username !== null && password !== null) {
            MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) { // Connect to database
                // Send error message if error occurs
                if (err) resolve(JSON.stringify({
                    status: false,
                    message: responseMessages.DATABASE_CONNECTION_ERROR,
                    error: err
                }));
                else {
                    // Check is username is taken
                    let db = client.db('smartmirror');
                    db.collection('users').findOne({"username": username}, (err, docs) => {
                        if (err) { // Send error message if error occurs
                            client.close();
                            resolve(JSON.stringify({
                                status: false,
                                message: responseMessages.DATABASE_COLLECTION_FIND_ERROR,
                                error: err
                            }));
                        }
                        if (docs) { // Username is already taken, send error message back
                            client.close();
                            resolve(JSON.stringify({
                                status: false,
                                message: responseMessages.USER_DATA_INVALID
                            }));
                        } else {
                            // If data is correct add new user document to users collection
                            db.collection('users').insertOne({
                                "username": username,
                                "password": SHA256(password).words, // hash password with SHA256
                                "widgets": new Array(8) // create an array with 8 empty fields for the widget arrangement
                            }, async function (err, res) {
                                if (err) { // Send error message if error occurs
                                    client.close();
                                    resolve(JSON.stringify({
                                        status: false,
                                        message: responseMessages.USER_REGISTRATION_ERROR,
                                        error: err
                                    }));
                                } else {
                                    client.close();
                                    resolve(JSON.stringify({ // Send success message if everything went fine
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
}

/**
 * Function to check if the sent user credentials are correct, create json web token if correct
 * @param username: Provided username to check, password: provided password to check
 * @returns {Promise<any>} Returns JSOB object with status, message and error message if applicable, token if no error occurs
 */
function signInUser(username, password) {
    return new Promise((resolve, reject) => {
        // Check for empty fields
        if (!username.trim() || !password) {
            resolve(JSON.stringify({ // Send error message if provided data is empty
                status: false,
                message: responseMessages.USER_DATA_INVALID
            }));
        } else {
            MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
                if (err) resolve(JSON.stringify({ // Send error message if error occurs
                    status: false,
                    message: responseMessages.DATABASE_CONNECTION_ERROR,
                    error: err
                }));
                else {
                    let db = client.db('smartmirror');
                    db.collection('users').findOne({"username": username}, (err, docs) => {
                        if (err) { // Send error message if error occurs
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
                                jwt.sign({ // Sign token if docs data matches provided data
                                    userId: docs._id
                                }, process.env.secretkey, (err, token) => {
                                    client.close();
                                    resolve(JSON.stringify({ // Send generated token as a response
                                        status: true,
                                        token: token,
                                        message: responseMessages.USER_DATA_SUCCESS,
                                    }));
                                });
                            } else { // Send error message if password is incorrect (doc data does not match provided data)
                                client.close();
                                resolve(JSON.stringify({
                                    status: false,
                                    message: responseMessages.USER_DATA_INVALID
                                }));
                            }
                        } else { // Send error message if username is incorrect (no docs found)
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
    });
}


/**
 * Function to get user data (the respective user document from the users collection)
 * @param userId: userId to search for in the collection
 * @returns {Promise<any>} Returns JSOB object with status, message and error message if applicable, user_data if no error occurs
 */
function getUserData(userId) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
            if (err) resolve(JSON.stringify({ // Send error message if error occurs
                status: false,
                message: responseMessages.DATABASE_CONNECTION_ERROR,
                error: err
            }));
            else {
                let db = client.db('smartmirror');
                db.collection('users').findOne({"_id": new ObjectId(userId)}, (err, res) => {
                    if (err) { // Send error message if error occurs
                        client.close();
                        resolve(JSON.stringify({
                            message: responseMessages.USER_DATA_INVALID,
                            error: err
                        }));
                    }
                    if (res) { // If no error occurs, send user data as a result
                        client.close();
                        resolve(JSON.stringify({
                            status: true,
                            user_data: res,
                            message: responseMessages.USER_DATA_SUCCESS
                        }));
                    } else { // If no user data was found, send error message
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
}

/**
 * Function to update the user widget arrangement of a user (documents from the users collection)
 * @param userId: user whose arrangement will be updated, widgetName: new widgets' name to insert, previousSlot: if provided delete
 *        the widget on this index, slot: if provided place the widget with widgetName on this index
 * @returns {Promise<any>} Returns JSOB object with status, message and error message if applicable
 */
function updateUserWidgets(userId, widgetName, previousSlot, slot) {
    return new Promise(async (resolve, reject) => {
        let entry = await this.getUserData(userId); // Get user data
        let widgets = JSON.parse(entry).user_data.widgets; // Handle variable for user widget arrangement
        if (previousSlot >= 0) { // If previousSlot available, delete widget on this index
            widgets[previousSlot] = null;
        }
        if (slot >= 0) { // if Slot available, place new widget on this index
            widgets[slot] = {
                name: widgetName
            };
        }
        MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
            if (err) resolve(JSON.stringify({ // Send error message if error occurs
                status: false,
                message: responseMessages.DATABASE_CONNECTION_ERROR,
                error: err
            }));
            else {
                let db = client.db('smartmirror');
                // Update user document with new widget arrangement
                await db.collection('users').updateOne({"_id": new ObjectId(userId)}, {$set: {widgets: widgets}}, (err, result) => {
                    if (err) resolve(JSON.stringify({ // send error message if error occurs during update process
                        status: false,
                        message: responseMessages.DATABASE_COLLECTION_UPDATE_ERROR,
                        error: err
                    }));
                    else {
                        client.close();
                        resolve(JSON.stringify({ // Success message if no error occurs
                            status: true,
                            message: responseMessages.DATABASE_COLLECTION_UPDATE_SUCCESS
                        }));
                    }
                });
            }
        });
    });
}

module.exports = {
    registerUser,
    signInUser,
    getUserData,
    updateUserWidgets
}
