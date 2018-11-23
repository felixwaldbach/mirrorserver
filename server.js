const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const database = require('./database');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const uuid = require('uuid/v4');

const port = process.env.PORT || 5000;

var http = require('http').Server(app);
var io = require('socket.io')(http);
var shell = require('shelljs');

const currentUser = "Emre";
const mongoURL = 'mongodb://127.0.0.1:27017/smartmirror';

require('dotenv').load();

//Setup Multer for uploading images
const storage = multer.diskStorage({
    destination: 'public/uploads/',
    filename: function (req, file, callback) {
        switch (file.mimetype) {
            case 'image/jpeg':
                ext = '.jpeg';
                break;
            case 'image/png':
                ext = '.png';
                break;
            default:
                ext = '';
        }
        callback(null, uuid() + ext);
    }
});
const upload = multer({storage: storage});


// for jsonwebtoken and session, verifies session token
function verifyToken(req, res, next) {
    const bearerHeader = req.headers.authorization;
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.json({
            message: "User is not authorized"
        });
    }
}

// Body parser to decode incoming json
app.use(bodyParser.json());

app.get('/api/hello', (req, res) => {
    res.send({express: 'Hello From Express'});
});

app.get('/api/user/getUserWidgetIds', (req, res) => {
    MongoClient.connect(mongoURL, {useNewUrlParser: true}, function (err, client) {
        if (err) {
            console.log('Unable to connect to MongoDB');
            throw err;
        } else {
            database.processGetUserWidgetIds(client.db('smartmirror'), req.query.user_id, res, client);
        }
    });
});


// HTTP Requests
// Register, check user credentials and create user with jwt
app.post('/native/signup', (req, res) => {
    MongoClient.connect(mongoURL, {useNewUrlParser: true}, function (err, client) {
        if (err) {
            console.log('Unable to connect to MongoDB');
            throw err;
        } else {
            database.registerUser(client.db('smartmirror'), req.body, res, client);
        }
    });
});

// Login, check if credentials are correct and send back access_token
app.post('/native/signin', (req, res) => {
    MongoClient.connect(mongoURL, {useNewUrlParser: true}, function (err, client) {
        if (err) {
            console.log('Unable to connect to MongoDB');
            throw err;
        } else {
            database.signInUser(client.db('smartmirror'), req.body, res, client);
        }
    });
});

// Login, check if credentials are correct and send back access_token
app.post('/api/user/setUserWidgetIds', (req, res) => {
    console.log("Receiving set user widget id post request");
    MongoClient.connect(mongoURL, {useNewUrlParser: true}, function (err, client) {
        if (err) {
            console.log('Unable to connect to MongoDB');
            throw err;
        } else {
            database.setUserWidgetIds(client.db('smartmirror'), req.body, res, client);
        }
    });
});

// Get user data
app.get('/native/getUserData', verifyToken, (req, res) => {
    MongoClient.connect(mongoURL, {useNewUrlParser: true}, function (err, client) {
        if (err) {
            console.log('Unable to connect to MongoDB');
            throw err;
        } else {
            jwt.verify(req.token, process.env.secretkey, (err, authData) => {
                if (err) {
                    res.json({});
                } else {
                    console.log("User verified...");
                    const userid = authData.userid;
                    database.getUserDataForCurrentUser(client.db('smartmirror'), res, userid, client);
                }
            });
        }
    });
});


// Uploading Image for Open CV
app.post('/native/uploadImage', verifyToken, upload.single('file'), (req, res) => {
    if (!req.file) {
        res.send(JSON.stringify({
            status: false,
            message: "Image could not be uploaded. Please try again!"
        }));
    } else {
        jwt.verify(req.token, process.env.secretkey, (err, authData) => {
            if (err) {
                res.json({
                    status: false,
                    message: "User is not authorized uploading images. Please reload the application and try again!"
                });
            } else {
                MongoClient.connect(mongoURL, {useNewUrlParser: true}, function (err, client) {
                    if (err) {
                        console.log('Unable to connect to MongoDB');
                        res.send(JSON.stringify({
                            status: false,
                            message: "Database error! Please contact administrator or try again!"
                        }));
                    } else {
                        const fileData = req.file;
                        const userId = authData.userid;
                        database.uploadImageToServer(client.db('smartmirror'), res, fileData, userId, client);
                    }
                });

            }
        });
    }
});

//
//
//
//
//
//


// Web Sockets
io.on('connection', function (socket) {
    console.log('a user connected');
    socket.send('testFromApi', {
        message: 'Hello World'
    });

    socket.on('message', function (data) {
        console.log(data);
    });

    // Weather Forecast
    socket.on('send_weather_forecast', function (data) {
        shell.exec("curl -H Accept:application/json -H Content-Type:application/json -X GET 'api.openweathermap.org/data/2.5/forecast?q=Stuttgart,DE&APPID=ba26397fa9d26d3655feda1b51d4b79d'", function (code, stdout, stderr) {
            let list = JSON.parse(stdout);
            console.log(list);
            console.log(typeof list);
            io.emit('five_day_forecast', {forecast: stdout});
        });
    });

    // Quotes Widget
    // Send random quotes to UI. Use CURL and GET
    socket.on('send_quotes', function (data) {
        shell.exec("curl -H Accept:application/json -H Content-Type:application/json -X GET https://talaikis.com/api/quotes/random/", function (code, stdout, stderr) {
            io.emit('new_quotes', {randomQuote: stdout});
        });
    });

    socket.on('app_drop_event', function (data) {
        io.emit('web_drop_event', data);
    });
});

http.listen(port, () => console.log(`Listening on port ${port}`));
