const MongoClient = require('mongodb').MongoClient;
const mongoURL = 'mongodb://127.0.0.1:27017/smartmirror';
const responseMessages = require('../responseMessages');

var getUserWidgets = async function (user_id) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
            if (err) resolve(JSON.stringify({
                status: false,
                message: responseMessages.DATABASE_CONNECTION_ERROR,
                error: err
            }));
            else {
                if (user_id) {
                    let db = client.db('smartmirror');
                    db.collection('userWidgets').findOne({"user_id": user_id}, (err, docs) => {
                        if (err) resolve(JSON.stringify({
                            status: false,
                            message: responseMessages.DATABASE_COLLECTION_FIND_ERROR,
                            error: err
                        }));
                        if (docs) {
                            resolve({
                                status: true,
                                message: responseMessages.DATABASE_COLLECTION_FIND_SUCCESS,
                                data: JSON.stringify(docs)
                            });
                        } else {
                            resolve(JSON.stringify({
                                status: false,
                                message: responseMessages.DATABASE_NO_DATA_AVAILABLE
                            }));
                        }
                    });
                } else {
                    resolve(JSON.stringify({
                        status: false,
                        message: responseMessages.USER_DATA_INVALID
                    }));
                }
            }
        });
    });
}

const funcall = module.exports = {
//----------------------Get User Widget ids----------------------//
    processGetUserWidgets: async function (user_id) {
        return new Promise(async (resolve, reject) => {
            if (user_id) {
                let entry = await getUserWidgets(user_id);
                let widgets = entry.data ? JSON.parse(entry.data).widgets : [];
                widgets.forEach(function (widget, index) {
                    if (widget !== null) widget.slot = index;
                });
                if (widgets) {
                    resolve(JSON.stringify({
                        status: true,
                        message: responseMessages.WIDGETS_SUCCESS,
                        data: widgets
                    }));
                } else {
                    resolve(JSON.stringify({
                        status: false,
                        message: responseMessages.WIDGETS_NO_DATA
                    }));
                }
            } else {
                resolve(JSON.stringify({
                    status: false,
                    message: responseMessages.USER_DATA_INVALID
                }));
            }
        });
    },

    //----------------------Set User Widget ids----------------------//
    setUserWidgets: async function (data) {
        return new Promise(async (resolve, reject) => {
            if (data.user_id) {
                let entry = await getUserWidgets(data.user_id);
                let widgets = entry.data ? JSON.parse(entry.data).widgets : [];
                if (data.previous_slot) {
                    widgets[data.previous_slot] = null;
                }
                widgets[data.slot] = {
                    widget_id: data.widget.widget_id,
                    widget_name: data.widget.widget_name
                };
                MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
                    if (err) resolve(JSON.stringify({
                        status: false,
                        message: responseMessages.DATABASE_CONNECTION_ERROR,
                        error: err
                    }));
                    else {
                        let db = client.db('smartmirror');
                        await db.collection('userWidgets').updateOne({"user_id": data.user_id}, {$set: {widgets: widgets}}, (err, result) => {
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
            } else {
                client.close();
                resolve(JSON.stringify({
                    status: false,
                    message: responseMessages.USER_DATA_INVALID
                }));
            }
        });
    },

    //----------------------Set User Widget ids----------------------//
    removeUserWidgets: async function (data) {
        return new Promise(async (resolve, reject) => {
            if (data.user_id) {
                let entry = await getUserWidgets(data.user_id);
                let widgets = entry.widgets;
                widgets[data.slot] = null;
                MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
                    if (err) resolve(JSON.stringify({
                        status: false,
                        message: responseMessages.DATABASE_CONNECTION_ERROR,
                        error: err
                    }));
                    else {
                        let db = client.db('smartmirror');
                        await db.collection('userWidgets').updateOne({"user_id": data.user_id}, {$set: {widgets: widgets}}, (err, result) => {
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
            } else {
                resolve(JSON.stringify({
                    status: false,
                    message: responseMessages.USER_DATA_INVALID
                }));
            }
        });
    },

    createDocument: async function (username) {
        return new Promise(async (resolve, reject) => {
            MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
                if (err) resolve(JSON.stringify({
                    status: false,
                    message: responseMessages.DATABASE_CONNECTION_ERROR,
                    error: err
                }));
                else {
                    let db = client.db('smartmirror');
                    let userWidgets = await getUserWidgets(username);
                    if (userWidgets.status) resolve(JSON.stringify({
                        status: false,
                        message: responseMessages.USER_WIDGETS_AVAILABLE
                    }));
                    else {
                        db.collection('userWidgets').insertOne({
                            "user_id": username,
                            "widgets": []
                        }, function (err, res) {
                            if (err) {
                                client.close();
                                resolve(JSON.stringify({
                                    status: false,
                                    message: responseMessages.USER_WIDGETS_ERROR,
                                    error: err
                                }));
                            } else {
                                client.close();
                                resolve(JSON.stringify({
                                    status: true,
                                    message: responseMessages.USER_WIDGETS_SUCCESS
                                }));
                            }
                        });
                    }
                }
            });
        });
    }
}