const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const wunderlistCollectionUtils = require('./database/wunderlistCollectionUtils');
const weatherCollectionUtils = require('./database/weatherCollectionUtils');
const jwt = require('jsonwebtoken');
const mosca = require('mosca');
const fetch = require('node-fetch');
const weatherIcons = require('./jsonModels/weatherIcons');
const utils = require('./utils');

const port = process.env.PORT || 5000;
app.use("/public", express.static(__dirname + '/public'));

var http = require('http').Server(app);
var io = require('socket.io')(http);
var shell = require('shelljs');
var mqttServ = new mosca.Server({});
mqttServ.attachHttpServer(http);

var apiRouter = require('./routes/api');
var nativeRouter = require('./routes/native');

const mongoURL = 'mongodb://127.0.0.1:27017/smartmirror';

const config = require('./config');
const os = require('os');
require('dotenv').load();


// Body parser to decode incoming json
app.use(bodyParser.json());
app.use(cors());

app.use('/api', apiRouter);
app.use('/native', nativeRouter);


// Web Sockets
io.on('connection', function (socket) {
    console.log('a user has connected');
    socket.send('testFromApi', {
        message: 'Hello World'
    });

    socket.on('message', function (data) {
        console.log(data);
    });

    // Weather Forecast
    socket.on('send_weather_forecast', async function (data) {
        // get city of user
        let response = await weatherCollectionUtils.getWeatherSettings(userId);
        let requiredCity = JSON.parse(response).settings.city;

        // with this city, fetch weather forecast from openweathermap
        let responseForecast = {};
        await fetch("http://api.openweathermap.org/data/2.5/forecast?q=" + requiredCity + "&APPID=" + process.env.weatherkey + "&units=metric", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(res =>
                res.json()
            )
            .then(json => {
                responseForecast = json;
            });

        // calculate next five days to extract from the list
        let today = new Date();
        let tomorrow = new Date();
        let dayThree = new Date();
        let dayFour = new Date();
        let dayFive = new Date();
        tomorrow.setDate(today.getDate() + 1);
        dayThree.setDate(today.getDate() + 2);
        dayFour.setDate(today.getDate() + 3);
        dayFive.setDate(today.getDate() + 4);

        today = today.toJSON().slice(0, 10).replace(/-/g, '-');
        tomorrow = tomorrow.toJSON().slice(0, 10).replace(/-/g, '-');
        dayThree = dayThree.toJSON().slice(0, 10).replace(/-/g, '-');
        dayFour = dayFour.toJSON().slice(0, 10).replace(/-/g, '-');
        dayFive = dayFive.toJSON().slice(0, 10).replace(/-/g, '-');

        let today_selected = false;
        let forecast = [];
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thurdsay", "Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thurdsay", "Friday", "Saturday"];

        // extract five days, take 12pm of every day and connect with className of weather icons
        // push these into the new array
        for (x in responseForecast.list) {
            // get weather from today, get the next timestamp -> first one in the main array
            if (today_selected === false) {
                forecast.push({
                    "weekday": weekdays[new Date().getDay()],
                    "temp": responseForecast.list[0].main.temp,
                    "weather": responseForecast.list[0].weather[0].main,
                    "icon": weatherIcons[responseForecast.list[0].weather[0].main]
                });
                today_selected = true;
            }
            // get weather for tomorrow
            if (responseForecast.list[x].dt_txt === tomorrow + ' 15:00:00') {
                forecast.push({
                    "weekday": weekdays[new Date().getDay() + 1],
                    "temp": responseForecast.list[x].main.temp,
                    "weather": responseForecast.list[x].weather[0].main,
                    "icon": weatherIcons[responseForecast.list[x].weather[0].main]
                });
            }
            // get weather for day 3
            if (responseForecast.list[x].dt_txt === dayThree + ' 15:00:00') {
                forecast.push({
                    "weekday": weekdays[new Date().getDay() + 2],
                    "temp": responseForecast.list[x].main.temp,
                    "weather": responseForecast.list[x].weather[0].main,
                    "icon": weatherIcons[responseForecast.list[x].weather[0].main]
                });
            }
            // get weather for day 4
            if (responseForecast.list[x].dt_txt === dayFour + ' 15:00:00') {
                forecast.push({
                    "weekday": weekdays[new Date().getDay() + 3],
                    "temp": responseForecast.list[x].main.temp,
                    "weather": responseForecast.list[x].weather[0].main,
                    "icon": weatherIcons[responseForecast.list[x].weather[0].main]
                });
            }
            // get weather for day 5
            if (responseForecast.list[x].dt_txt === dayFive + ' 15:00:00') {
                forecast.push({
                    "weekday": weekdays[new Date().getDay() + 4],
                    "temp": responseForecast.list[x].main.temp,
                    "weather": responseForecast.list[x].weather[0].main,
                    "icon": weatherIcons[responseForecast.list[x].weather[0].main]
                });
            }
        }

        // send list to ui
        io.emit('required_city_weather', {forecast: forecast, city: requiredCity});
    });

    // Quotes Widget
    // Send random quotes to UI. Use CURL and GET
    socket.on('send_quotes', async function (data) {
        await fetch("http://quotesondesign.com/wp-json/posts", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(res =>
                res.json()
            )
            .then(json => {
                randomQuote = json;
            });
        // delete html tags: object to string. delete. string back to object
        let quoteAsString = JSON.stringify(randomQuote);
        quoteAsString = quoteAsString.replace(/<\/?[^>]+(>|$)/g, "");
        let quote = JSON.parse(quoteAsString);
        io.emit('new_quotes', quote[0]);
    });

    socket.on('app_drop_event', function (data) {
        jwt.verify(data.token, process.env.secretkey, async (err, authData) => {
            if (err) {
                throw err;
            } else {
                data.user_id = authData.user_id;
                io.emit('web_drop_event', data);
            }
        });
    });

    // Wunderlist Widget
    socket.on('send_wunderlist_settings', async function (data) {
        const response = await wunderlistCollectionUtils.sendCredentials(currentUser);
        io.emit('wunderlist_settings', response);
    });

    socket.on('app_trigger_face_id', function (data) {
        jwt.verify(data.token, process.env.secretkey, async (err, authData) => {
            if (err) {
                throw err;
            } else {
                data.user_id = authData.user_id;
                data.message = "Face ID will be created shortly. Get ready and smile!";
                io.emit('web_trigger_face_id', data);
                setTimeout(async () => {
                    data.message = "Processing images. Keep smiling!";
                    io.emit('web_trigger_face_id', data);
                    await utils.storeFaceDataset(config.mirror_uuid, authData.user_id).then(() => {
                        data.message = "Processing images done. Keep smiling though :)";
                        io.emit('web_trigger_face_id', data);
                        //send pir motion detection ?
                    });
                }, 10);
            }
        });
    });
});


// MQTT
mqttServ.on('clientConnected', function (client) {
    console.log('client connected: ' + client.id);
});

mqttServ.on('ready', function () {
    console.log('Mosca MQTT server is up and running');
});

// fired when a message is received
mqttServ.on('published', async function (packet, client) {
    console.log(packet.topic);
    console.log(packet.payload.toString('utf8'));
    switch (packet.topic) {
        case 'temperature/inside':
            io.emit('temperature_inside_data', packet.payload.toString('utf8'));
            break;
        case 'temperature/outside':
            io.emit('temperature_outside_data', packet.payload.toString('utf8'));
            break;
        case 'temperature/pir':
            // 1 = motion detected, 0 = no motion detected, take pictures and send to django server which will return the user_id of the recognized user
            if (packet.payload.toString('utf8') == "1") {
                // start session
                let response;

                response = await utils.initializeWebcam(os.platform());
                response = await utils.takeImage(response.Webcam, os.platform(), 0, config.mirror_uuid);
                response = await utils.recognizeImage(config.mirror_uuid, response.base64);
                console.log(response);
                //res.send(JSON.stringify(response)); // coming from django server

                // create no expiring session token with the user_id of the recognized user

                if(response.status) {
                    jwt.sign({
                        user_id: response.user_id
                    }, process.env.secretkey, (err, token) => {
                        client.close();
                        io.emit('handle_session', {
                            token: token,
                            user_id: response.user_id,
                            motion: packet.payload.toString('utf8')
                        });
                    });
                } else {
                    console.log("Something went wrong during face recognition...");
                    io.emit('handle_session', {user_id: "empty", motion: "0"});     // kill session because error happened, try again in 3 minutes...
                }
            } else {
                // kill session because no one is in front of the mirror
                io.emit('handle_session', {user_id: "empty", motion: packet.payload.toString('utf8')});
            }
            break;
    }
});


http.listen(port, () => console.log(`Listening on port ${port}`));
