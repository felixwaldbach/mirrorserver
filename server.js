const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const userWidgetsCollectionUtils = require('./database/userWidgetsCollectionUtils');
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;
app.use("/public", express.static(__dirname + '/public'));

var http = require('http').Server(app);
var io = require('socket.io')(http);
var shell = require('shelljs');


var apiRouter = require('./routes/api');
var nativeRouter = require('./routes/native');

const currentUser = "felix";
const mongoURL = 'mongodb://127.0.0.1:27017/smartmirror';

require('dotenv').load();


// Body parser to decode incoming json
app.use(bodyParser.json());

app.use('/api', apiRouter);
app.use('/native', nativeRouter);


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

    socket.on('app_delete_event', async function (data) {
        jwt.verify(data.token, process.env.secretkey, async (err, authData) => {
            if (err) {
                throw err;
            } else {
                data.user_id = authData.username;
                const response = await userWidgetsCollectionUtils.removeUserWidgets(data);
                console.log(response);
                io.emit('web_delete_event', data);
            }
        });

        // Wunderlist Widget
        socket.on('send_wunderlist_settings', function (data) {
            MongoClient.connect(mongoURL, {useNewUrlParser: true}, function (err, client) {
                if (err) {
                    console.log('Unable to connect to MongoDB');
                } else {
                    client.db('smartmirror').collection('users').findOne({"username": currentUser}, (err, res_find_user) => {
                        if (err) {
                            client.close();
                            throw err;
                        } else {
                            let userId = res_find_user._id;
                            client.db('smartmirror').collection('wunderlist').findOne({"user_id": new ObjectId(userId)}, (err, res_find_wunderlist_settings) => {
                                if (err) {
                                    client.close();
                                    throw err;
                                } else {
                                    client.close();
                                    socket.emit('wunderlist_settings', res_find_wunderlist_settings);
                                }
                            });
                        }
                    });
                }
            });
        });
    });
});

http.listen(port, () => console.log(`Listening on port ${port}`));
