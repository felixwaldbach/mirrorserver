const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const userWidgetsCollectionUtils = require('./database/userWidgetsCollectionUtils');
const wunderlistCollectionUtils = require('./database/wunderlistCollectionUtils');
const weatherCollectionUtils = require('./database/weatherCollectionUtils');
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectId;
const mosca = require('mosca');
const fetch = require('node-fetch');
const weatherIcons = require('./jsonModels/weatherIcons');

const port = process.env.PORT || 5000;
app.use("/public", express.static(__dirname + '/public'));

var http = require('http').Server(app);
var io = require('socket.io')(http);
var shell = require('shelljs');
var mqttServ = new mosca.Server({});
mqttServ.attachHttpServer(http);

var apiRouter = require('./routes/api');
var nativeRouter = require('./routes/native');

const currentUser = "Emre";
const userId = "5bf42e57e8d590da0243a593";
const mongoURL = 'mongodb://127.0.0.1:27017/smartmirror';

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
        await fetch("http://api.openweathermap.org/data/2.5/forecast?q="+requiredCity+"&APPID="+process.env.weatherkey+"&units=metric", {
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
        let dayFour= new Date();
        let dayFive = new Date();
        tomorrow.setDate(today.getDate()+1);
        dayThree.setDate(today.getDate()+2);
        dayFour.setDate(today.getDate()+3);
        dayFive.setDate(today.getDate()+4);

        today = today.toJSON().slice(0,10).replace(/-/g,'-');
        tomorrow = tomorrow.toJSON().slice(0,10).replace(/-/g,'-');
        dayThree = dayThree.toJSON().slice(0,10).replace(/-/g,'-');
        dayFour = dayFour.toJSON().slice(0,10).replace(/-/g,'-');
        dayFive = dayFive.toJSON().slice(0,10).replace(/-/g,'-');

        let today_selected = false;
        let forecast = [];
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thurdsay", "Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thurdsay", "Friday", "Saturday"];

        // extract five days, take 12pm of every day and connect with className of weather icons
        // push these into the new array
        for (x in responseForecast.list) {
            // get weather from today, get the next timestamp -> first one in the main array
            if(today_selected === false) {
                forecast.push({
                    "weekday": weekdays[new Date().getDay()],
                    "temp": responseForecast.list[0].main.temp,
                    "weather": responseForecast.list[0].weather[0].main,
                    "icon": weatherIcons[responseForecast.list[0].weather[0].main]
                });
                today_selected = true;
            }
            // get weather for tomorrow
            if(responseForecast.list[x].dt_txt === tomorrow + ' 15:00:00') {
                forecast.push({
                    "weekday": weekdays[new Date().getDay()+1],
                    "temp": responseForecast.list[x].main.temp,
                    "weather": responseForecast.list[x].weather[0].main,
                    "icon": weatherIcons[responseForecast.list[x].weather[0].main]
                });
            }
            // get weather for day 3
            if(responseForecast.list[x].dt_txt === dayThree + ' 15:00:00') {
                forecast.push({
                    "weekday": weekdays[new Date().getDay()+2],
                    "temp": responseForecast.list[x].main.temp,
                    "weather": responseForecast.list[x].weather[0].main,
                    "icon": weatherIcons[responseForecast.list[x].weather[0].main]
                });
            }
            // get weather for day 4
            if(responseForecast.list[x].dt_txt === dayFour + ' 15:00:00') {
                forecast.push({
                    "weekday": weekdays[new Date().getDay()+3],
                    "temp": responseForecast.list[x].main.temp,
                    "weather": responseForecast.list[x].weather[0].main,
                    "icon": weatherIcons[responseForecast.list[x].weather[0].main]
                });
            }
            // get weather for day 5
            if(responseForecast.list[x].dt_txt === dayFive + ' 15:00:00') {
                forecast.push({
                    "weekday": weekdays[new Date().getDay()+4],
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
    socket.on('send_quotes', function (data) {
        shell.exec("curl -H Accept:application/json -H Content-Type:application/json -X GET http://quotesondesign.com/wp-json/posts", function (code, stdout, stderr) {
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
    });

    // Wunderlist Widget
    socket.on('send_wunderlist_settings', async function (data) {
        const response = await wunderlistCollectionUtils.sendCredentials(currentUser);
        io.emit('wunderlist_settings', response);
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
mqttServ.on('published', function (packet, client) {
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
            io.emit('pir_motion_data', packet.payload.toString('utf8'));
            break;
    }
});


http.listen(port, () => console.log(`Listening on port ${port}`));
