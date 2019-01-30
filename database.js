const jwt = require('jsonwebtoken');
const uuid = require('uuid/v4');
const SHA256 = require('crypto-js/sha256');
const ObjectId = require('mongodb').ObjectId;

var getUserWidgets = async function (db, user_id) {
    return new Promise((resolve, reject) => {
        if (user_id) {
            db.collection('userWidgets').findOne({"user_id": user_id}, (err, docs) => {
                if (err) resolve(null);
                if (docs) {
                    resolve(docs);
                } else {
                    resolve(null);
                }
            });

        } else {
            resolve(null);
        }
    });
}

const funcall = module.exports = {

    //----------------------Register user----------------------//
    registerUser: function (db, newUserData, res, client) {
        let username = newUserData.username;
        let password = newUserData.password;

        // Check for empty or blank entries
        if (username.trim().length !== 0 && password.trim().length !== 0 && username !== null && password !== null) {

            // Check is username is taken
            db.collection('users').findOne({"username": username}, (err, docs) => {
                if (err) throw err;
                if (docs) {
                    res.send(JSON.stringify({
                        status: false,
                        message: "This username is not available. Please try another one."
                    }));
                    client.close();
                } else {

                    // Add new user to database with hashed password
                    db.collection('users').insertOne({
                        "username": username,
                        "password": SHA256(password).words,
                        "face_image": ""
                    }, function (err, result) {
                        if (err) {
                            console.log(err);
                            res.send(JSON.stringify({
                                status: false,
                                message: "Something went wrong registering this user. Please try again!"
                            }));
                        } else {
                            console.log("User created: " + username);
                            res.send(JSON.stringify({
                                status: true,
                                message: "Your user registration was successful. Please go to Login!"
                            }));
                        }
                    });
                }
            });

        } else {
            res.send(JSON.stringify({
                status: false,
                message: "User data can't be empty."
            }));
            client.close();
        }
    },

    signInUser: function (db, userData, res, client) {
        let username = userData.username;
        let password = userData.password;

        // Check for empty fields
        if (!username.trim() || !password) {
            res.send(JSON.stringify({
                status: false,
                message: "All fields are required."
            }));
        } else {
            // Check for blank fields
            if (username != null && password != null) {
                db.collection('users').findOne({"username": username}, (err, docs) => {
                    if (err) {
                        console.log(username + " failed to login.");
                        res.send(JSON.stringify({
                            status: false,
                            message: "Sorry, your password is incorrect. Please check again!"
                        }));
                        client.close();
                        throw err;
                    }
                    if (docs) {
                        //console.log(SHA256(password).words);
                        //console.log(docs.password);
                        // Check if account password of username is right
                        if (JSON.stringify(SHA256(password).words) === JSON.stringify(docs.password)) {
                            jwt.sign({
                                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 60 * 60 * 24),
                                userid: docs._id,
                                username: docs.username
                            }, process.env.secretkey, (err, token) => {
                                console.log(docs.username + " has logged in successfully.");
                                res.send(JSON.stringify({
                                    status: true,
                                    token: token,
                                    message: "Correct credentials",
                                }));
                                client.close();
                            });
                        } else {
                            console.log(username + " failed to login.")
                            res.send(JSON.stringify({
                                status: false,
                                message: "Sorry, your password is incorrect. Please check again."
                            }));
                            client.close();
                        }
                    } else {
                        console.log(username + " failed to login.");
                        res.send(JSON.stringify({
                            status: false,
                            message: "Sorry, your password is incorrect. Please check again."
                        }));
                        client.close();
                    }
                });
            }
        }
    },

    //----------------------Get Current User----------------------//
    getUserDataForCurrentUser: function (db, res, userid, client) {
        // Return logged in user information with token of jwt
        db.collection('users').findOne({"_id": new ObjectId(userid)}, (err, res_find_user) => {
            if (err) {
                res.send(JSON.stringify({
                    message: "User not found"
                }));
                client.close();
                throw err;
            }
            if (res_find_user) {
                res.send(JSON.stringify({
                    status: true,
                    username: res_find_user.username,
                    face_image: res_find_user.face_image
                }));
                client.close();
            } else {
                res.send(JSON.stringify({
                    status: false,
                    message: "User not found"
                }));
                client.close();
            }
        })
    },

    //----------------------Update user face image----------------------//
    uploadImageToServer: function (db, res, fileData, userId, client) {
        db.collection("users").updateOne({_id: new ObjectId(userId)},
            {
                $set: {face_image: fileData.filename}
            }, (err, response) => {
                if (err) {
                    throw err;
                } else {
                    if (response.result.ok === 1) {
                        console.log("Image uploaded successfully for user: " + userId);
                        res.send(JSON.stringify({
                            status: true,
                            message: "Image uploaded successfully!"
                        }));
                    } else {
                        console.log("Updating image failed!");
                        res.send(JSON.stringify({
                            status: false,
                            message: "Updating image failed. Please try again!"
                        }));
                    }
                    client.close();
                }
            });
    },

    //----------------------Get User Widget ids----------------------//
    processGetUserWidgets: async function (db, user_id, res, client) {
        if (user_id) {

            let entry = await getUserWidgets(db, user_id);
            let widgets = entry.widgets;
            widgets.forEach(function (widget, index) {
                if (widget !== null) widget.slot = index;
            })
            if (widgets) {
                res.send(JSON.stringify({
                    status: true,
                    message: "User widgets found.",
                    data: widgets
                }));
                client.close();
            } else {
                res.send(JSON.stringify({
                    status: false,
                    message: "No user widgets found"
                }));
                client.close();
            }
        } else {
            res.send(JSON.stringify({
                status: false,
                message: "User ID undefined"
            }));
            client.close();
        }
    },

    //----------------------Set User Widget ids----------------------//
    setUserWidgets: async function (db, data, res, client) {
        if (data.user_id) {
            let entry = await getUserWidgets(db, data.user_id);
            let widgets = entry.widgets;
            if (data.previous_slot) {
                widgets[data.previous_slot] = null;
            }
            widgets[data.slot] = {widget_id: data.widget.widget_id, widget_name: data.widget.widget_name};
            await db.collection('userWidgets').updateOne({"user_id": data.user_id}, {$set: {widgets: widgets}}, (err, result) => {
                if (err) throw err;
                else {
                    res.send(JSON.stringify({
                        status: true,
                        message: "User widgets updated."
                    }));
                    client.close();
                }
            });
        } else {
            res.send(JSON.stringify({
                status: false,
                message: "User ID undefined"
            }));
            client.close();
        }
    },

    //----------------------Set User Widget ids----------------------//
    removeUserWidgets: async function (db, data, client) {
        if (data.user_id) {
            let entry = await getUserWidgets(db, data.user_id);
            let widgets = entry.widgets;
            console.log("Removing slot " + data.slot);
            widgets[data.slot] = null;
            await db.collection('userWidgets').updateOne({"user_id": data.user_id}, {$set: {widgets: widgets}}, (err, result) => {
                if (err) throw err;
                else {
                    client.close()
                    return {
                        type: 'success',
                        message: 'removeUserWidgets successfully executed'
                    }
                }
            });
        } else {
            return {
                type: 'error',
                message: 'An error occured during removeUserWidgets'
            }
        }
    },

    //----------------------Set User Widget ids----------------------//
    getAllWidgets: async function (db, res, client) {
        db.collection('allWidgets').find().toArray((err, docs) => {
            if (err) throw err;
            if (docs) {
                let all_widgets = [];
                docs.forEach(function (doc) {
                    all_widgets.push({
                        widget_id: doc.widget_id,
                        widget_name: doc.widget_name
                    });
                })
                res.send(JSON.stringify({
                    status: true,
                    message: "Widgets found.",
                    data: {
                        all_widgets: all_widgets
                    }
                }));
                client.close();
        }
    },

  //----------------------Get Current User----------------------//
  getUserDataForCurrentUser: function(db, res, userid, client) {
    // Return logged in user information with token of jwt
    db.collection('users').findOne({"_id": new ObjectId(userid)}, (err, res_find_user) => {
        if (err) {
          res.send(JSON.stringify({
            message: "User not found"
          }));
          client.close();
          throw err;
        }
        if (res_find_user) {
          res.send(JSON.stringify({
            status: true,
            userid: userid,
            username: res_find_user.username,
            face_image: res_find_user.face_image
          }));
          client.close();
        }
        else {
          res.send(JSON.stringify({
            status: false,
            message: "User not found"
          }));
          client.close();
        }
    })
  },

  //----------------------Update user face image----------------------//
  uploadImageToServer: function (db, res, fileData, userId, client) {
    db.collection("users").updateOne({ _id : new ObjectId(userId) },
        {
            $set: { face_image: fileData.filename }
        }, (err, response) => {
          if (err) {
            throw err;
          } else {
            if(response.result.ok === 1) {
              console.log("Image uploaded successfully for user: " + userId);
              res.send(JSON.stringify({
                status: true,
                message: "Image uploaded successfully!"
              }));
            } else {
                res.send(JSON.stringify({
                    status: false,
                    message: "No Widgets found."
                }));
                client.close();
            }
        });
    }

  //----------------------Get Wunderlist settings from current user----------------------//
  uploadWunderlistSettings: function (db, settings, res, userId, client) {
    let todo_list = settings.todoList;
    let client_secret = settings.wl_access_token;
    let client_id = settings.wl_client_id;

    // Check for empty or blank entries
    if (todo_list.trim().length !== 0 && client_secret.trim().length !== 0 && client_id.trim().length !== 0 && todo_list !== null && client_secret !== null && client_id !== null) {
      // Check if has already settings

      db.collection('wunderlist').findOne({"user_id": new ObjectId(userId)}, (err, docs) => {
          if (err) throw err;
          if (docs) {
            // UPDATE current settings
            db.collection("wunderlist").updateOne({"user_id": new ObjectId(userId)},
                {
                    $set: { todo_list: todo_list, client_secret: client_secret, client_id: client_id}
                }, (err, response) => {
                  if (err) {
                    throw err;
                  } else {
                    if(response.result.ok === 1) {
                      res.send(JSON.stringify({
                        status: true,
                        message: "Wunderlist Settings updated successfully!"
                      }));
                    } else {
                      res.send(JSON.stringify({
                        status: false,
                        message: "Error updating Wunderlist Settings. Please try again!"
                      }));
                    }
                    client.close();
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
                if(err) {
                  console.log(err);
                  res.send(JSON.stringify({
                    status: false,
                    message: "Something went wrong. Please try again!"
                  }));
                } else {
                    res.send(JSON.stringify({
                      status: true,
                      message: "Wunderlist Settings added successfully"
                    }));
                    client.close();
                }
            });
          }
      });
    } else {
      res.send(JSON.stringify({
          status: false,
          message: "Wunderlist Settings and lists can't be empty."
      }));
      client.close();
    }

  },

  //----------------------Get Wunderlist settings from current user----------------------//
  getWunderlistSettings: function (db, res, userid, client) {

    // JOIN in MongoDB
    db.collection('wunderlist').aggregate([
      { $lookup:
        {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $project:
          {
            "todo_list": 1,
            "client_secret": 1,
            "client_id": 1,
            "username": "$user.username",
            "face_image": "$user.face_image",
          }
      }
    ]).toArray((err_settings, res_settings) => {
        if (err_settings) throw err_settings;
        res_settings.map(item => {
          item.todo_list = item.todo_list;
          item.client_secret = item.client_secret;
          item.client_id = item.client_id;
          item.face_image = item.face_image[0];
          item.username = item.username[0];
        });
        res.send(JSON.stringify({
          status: true,
          settings: res_settings[0]
        }));
        client.close();
    });


  },


}
