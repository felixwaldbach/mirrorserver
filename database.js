const jwt = require('jsonwebtoken');
const uuid = require('uuid/v4');
const SHA256 = require('crypto-js/sha256');

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
                state: false,
                message: "This username is not available. Please try another one."
            }));
            client.close();
          } else {

            // Add new user to database with hashed password
            db.collection('users').insertOne({
                "username": username,
                "password": SHA256(password).words,
                "access_token": "",
                "face_image": ""
            }, function (err, result) {
                if(err) {
                  console.log(err);
                  res.send(JSON.stringify({
                    state: false,
                    message: "Something went wrong registering this user. Please try again!"
                  }));
                } else {
                    console.log("User created: " + username);
                    res.send(JSON.stringify({
                      state: true,
                      message: "Your user registration was successful. Please go to Login!"
                    }));
                }
            });
          }
      });

    } else {
        res.send(JSON.stringify({
            state: false,
            message: "User data can't be empty."
        }));
        client.close();
      }
  },

}
