const MongoClient = require('mongodb').MongoClient;
const mongoURL = 'mongodb://127.0.0.1:27017/smartmirror';
const responseMessages = require('../responseMessages');

const funcall = module.exports = {
    //----------------------Set User Widget ids----------------------//
    getWidgets: async function () {
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
                    })
                }
            })
        })
    }
}