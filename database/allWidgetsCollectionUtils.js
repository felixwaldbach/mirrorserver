const MongoClient = require('mongodb').MongoClient;
const mongoURL = 'mongodb://127.0.0.1:27017/smartmirror';
const responseMessages = require('../responseMessages');

const funcall = module.exports = {
    //----------------------Set User Widget ids----------------------//
    getAllWidgets: async function () {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
                if (err) resolve(JSON.stringify({
                    status: false,
                    message: responseMessages.DATABASE_CONNECTION_ERROR,
                    error: err
                }));
                else {
                    let db = client.db('smartmirror');
                    db.collection('allWidgets').find().toArray((err, docs) => {
                        if (err) {
                            client.close();
                            resolve(JSON.stringify({
                                status: false,
                                message: responseMessages.DATABASE_COLLECTION_FIND_ERROR,
                                error: err
                            }));
                        } else {
                            if (docs) {
                                let all_widgets = [];
                                docs.forEach(function (doc) {
                                    all_widgets.push({
                                        widget_id: doc.widget_id,
                                        widget_name: doc.widget_name
                                    });
                                });
                                client.close();
                                resolve(JSON.stringify({
                                    status: true,
                                    message: responseMessages.WIDGETS_SUCCESS,
                                    data: {
                                        all_widgets: all_widgets
                                    }
                                }));
                            }
                        }
                    })
                }
            })
        })
    }
}