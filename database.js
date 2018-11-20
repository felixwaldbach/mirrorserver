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
                status: false,
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

  signInUser: function(db, userData, res, client) {
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
                  // Check if account password of username is right
                  if (JSON.stringify(password.words) === JSON.stringify(docs.password.words)) {
                    jwt.sign({
                      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 60 * 60 * 24),
                      userid: docs._id,
                      username: docs.username
                  }, process.env.secretkey, (err, token) => {
                      console.log(docs.username + " has logged in successfully.");
                      res.send(JSON.stringify({
                          status: true,
                          token: token,
                          message : "Correct credentials",
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
                }
                else {
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

}
