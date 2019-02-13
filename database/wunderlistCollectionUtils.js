const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
const mongoURL = 'mongodb://127.0.0.1:27017/smartmirror';

const funcall = module.exports = {
    //----------------------Get Wunderlist settings from current user----------------------//
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
                        message: "Database connection could not be established",
                        error: err
                    }));
                    else {
                        let db = client.db('smartmirror');
                        db.collection('wunderlist').findOne({"user_id": new ObjectId(userId)}, (err, docs) => {
                            if (err) resolve(JSON.stringify({
                                status: false,
                                message: "An error occured",
                                error: err
                            }));
                            if (docs) {
                                // UPDATE current settings
                                db.collection("wunderlist").updateOne({"user_id": new ObjectId(userId)},
                                    {
                                        $set: {todo_list: todo_list, client_secret: client_secret, client_id: client_id}
                                    }, (err, response) => {
                                        if (err) {
                                            client.close();
                                            resolve(JSON.stringify({
                                                status: false,
                                                message: "An error occured",
                                                error: err
                                            }));
                                        } else {
                                            if (response.result.ok === 1) {
                                                client.close();
                                                resolve(JSON.stringify({
                                                    status: true,
                                                    message: "Wunderlist Settings updated successfully!"
                                                }));
                                            } else {
                                                client.close();
                                                resolve(JSON.stringify({
                                                    status: false,
                                                    message: "Error updating Wunderlist Settings. Please try again!"
                                                }));
                                            }
                                        }
                                    });
                            } else {
                                // Add new entry
                                db.collection('wunderlist').insertOne({
                                    "user_id": new ObjectId(userId),
                                    "todo_list": todo_list,
                                    "client_secret": client_secret,
                                    "client_id": client_id
                                }, function (err, result) {
                                    if (err) {
                                        client.close();
                                        resolve(JSON.stringify({
                                            status: false,
                                            message: "Something went wrong. Please try again!"
                                        }));
                                    } else {
                                        client.close();
                                        resolve(JSON.stringify({
                                            status: true,
                                            message: "Wunderlist Settings added successfully"
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
                    message: "Wunderlist Settings and lists can't be empty."
                }));
            }
        });
    },

    //----------------------Get Wunderlist settings from current user----------------------//
    getWunderlistSettings: function (userid) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongoURL, {useNewUrlParser: true}, async function (err, client) {
                if (err) resolve(JSON.stringify({
                    status: false,
                    message: "Database connection could not be established",
                    error: err
                }));
                else {
                    let db = client.db('smartmirror');
                    // JOIN in MongoDB
                    db.collection('wunderlist').aggregate([
                        {
                            $lookup:
                                {
                                    from: "users",
                                    localField: "user_id",
                                    foreignField: "_id",
                                    as: "user"
                                }
                        },
                        {
                            $project:
                                {
                                    "todo_list": 1,
                                    "client_secret": 1,
                                    "client_id": 1,
                                    "username": "$user.username",
                                    "face_image": "$user.face_image",
                                }
                        }
                    ]).toArray((err_settings, res_settings) => {
                        if (err_settings) resolve(JSON.stringify({
                            status: false,
                            message: "Settings error",
                            error: err
                        }));
                        res_settings.map(item => {
                            item.todo_list = item.todo_list;
                            item.client_secret = item.client_secret;
                            item.client_id = item.client_id;
                            item.face_image = item.face_image[0];
                            item.username = item.username[0];
                        });
                        client.close();
                        resolve(JSON.stringify({
                            status: true,
                            settings: res_settings[0]
                        }));
                    });
                }
            });
        });
    }
}