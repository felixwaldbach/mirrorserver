const MongoClient = require('mongodb').MongoClient;
const mongoURL = 'mongodb://127.0.0.1:27017/smartmirror';

var getUserWidgets = async function (user_id) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
            if (err) resolve(JSON.stringify({
                status: false,
                message: "Database connection could not be established",
                error: err
            }));
            else {
                if (user_id) {
                    let db = client.db('smartmirror');
                    db.collection('userWidgets').findOne({"user_id": user_id}, (err, docs) => {
                        if (err) resolve(JSON.stringify({
                            status: false,
                            message: "An error occured",
                            error: err
                        }));
                        if (docs) {
                            resolve(JSON.stringify({
                                status: true,
                                message: "Query executed successfully",
                                data: docs
                            }));
                        } else {
                            resolve(JSON.stringify({
                                status: false,
                                message: "No docs available"
                            }));
                        }
                    });
                } else {
                    resolve(JSON.stringify({
                        status: false,
                        message: "Invalid user id"
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
                let widgets = JSON.parse(entry).data.widgets;
                widgets.forEach(function (widget, index) {
                    if (widget !== null) widget.slot = index;
                });
                if (widgets) {
                    resolve(JSON.stringify({
                        status: true,
                        message: "User widgets found.",
                        data: widgets
                    }));
                } else {
                    resolve(JSON.stringify({
                        status: false,
                        message: "No user widgets found"
                    }));
                }
            } else {
                resolve(JSON.stringify({
                    status: false,
                    message: "User ID undefined"
                }));
            }
        });
    },

    //----------------------Set User Widget ids----------------------//
    setUserWidgets: async function (data) {
        return new Promise(async (resolve, reject) => {
            if (data.user_id) {
                let entry = await getUserWidgets(data.user_id);
                let widgets = entry.widgets;
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
                        message: "Database connection could not be established",
                        error: err
                    }));
                    else {
                        let db = client.db('smartmirror');
                        await db.collection('userWidgets').updateOne({"user_id": data.user_id}, {$set: {widgets: widgets}}, (err, result) => {
                            if (err) resolve(JSON.stringify({
                                status: false,
                                message: "An error occured",
                                error: err
                            }));
                            else {
                                client.close();
                                resolve(JSON.stringify({
                                    status: true,
                                    message: "User widgets updated."
                                }));
                            }
                        });
                    }
                });
            } else {
                client.close();
                resolve(JSON.stringify({
                    status: false,
                    message: "User ID undefined"
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
                        message: "Database connection could not be established",
                        error: err
                    }));
                    else {
                        let db = client.db('smartmirror');
                        await db.collection('userWidgets').updateOne({"user_id": data.user_id}, {$set: {widgets: widgets}}, (err, result) => {
                            if (err) resolve(JSON.stringify({
                                status: false,
                                message: "Database connection could not be established",
                                error: err
                            }));
                            else {
                                client.close();
                                resolve(JSON.stringify({
                                    status: true,
                                    message: "User widget successfully removed"
                                }));
                            }
                        });
                    }
                });
            } else {
                resolve(JSON.stringify({
                    status: false,
                    message: "An error occured while removing user widget"
                }));
            }
        });
    },

    createDocument: async function (username) {
        return new Promise(async (resolve, reject) => {
            MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
                if (err) resolve(JSON.stringify({
                    status: false,
                    message: "Database Connection could not be established",
                    error: err
                }));
                else {
                    let db = client.db('smartmirror');
                    let userWidgets = await getUserWidgets(username);
                    if (userWidgets.status) resolve(JSON.stringify({
                        status: false,
                        message: "User Widgets Document already exists for this user"
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
                                    message: "Something went wrong creating a user widget document for this user. Please try again!",
                                    error: err
                                }));
                            } else {
                                client.close();
                                resolve(JSON.stringify({
                                    status: true,
                                    message: "Your user widget document was successfully created."
                                }));
                            }
                        });
                    }
                }
            });
        });
    }
}