/**
 * Functions to access and change data inside the widget collection of the database
 * Requests are sent to the backend by the React Frontend and the React Native Smartphone app and handled by the respective
 * route/message handler in the backend
 */

const MongoClient = require('mongodb').MongoClient;
const mongoURL = 'mongodb://127.0.0.1:27017/smartmirror';

const responseMessages = require('../responseMessages'); // Standard response messages for HTTP requests websocket

/**
 * Function to get all widgets (documents from the widget collection)
 * @param -
 * @returns {Promise<any>} Returns JSOB object with status, message and error message if applicable
 */
async function getWidgets() {
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
            if (err) resolve(JSON.stringify({
                status: false,
                message: responseMessages.DATABASE_CONNECTION_ERROR,
                error: err
            }));
            else {
                let db = client.db('smartmirror');
                db.collection('widgets').find({}, {_id: 0}).toArray((err, docs) => {
                    if (err) {
                        client.close();
                        resolve(JSON.stringify({
                            status: false,
                            message: responseMessages.DATABASE_COLLECTION_FIND_ERROR,
                            error: err
                        }));
                    } else {
                        if (docs) {
                            client.close();
                            resolve(JSON.stringify({
                                status: true,
                                message: responseMessages.WIDGETS_SUCCESS,
                                widgets: docs
                            }));
                        }
                    }
                });
            }
        });
    });
}

module.exports = {
    getWidgets
}