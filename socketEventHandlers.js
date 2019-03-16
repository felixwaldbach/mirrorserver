const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const wunderlistCollectionUtils = require('./database/wunderlistCollectionUtils');
const weatherCollectionUtils = require('./database/weatherCollectionUtils');
const usersCollectionUtils = require('./database/usersCollectionUtils');
const config = require('./config');

const weatherIcons = require('./jsonModels/weatherIcons');

const utils = require('./utils');
const responseMessages = require('./responseMessages');

module.exports = function (socket, io) {

    socket.on('message', function (data) {
        console.log(data)
    })

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

    // Wunderlist Widget
    socket.on('send_wunderlist_settings', async function (data) {
        const response = await wunderlistCollectionUtils.sendCredentials(currentUser);
        io.emit('wunderlist_settings', response);
    });

    socket.on('app_trigger_face_id', function (data) {
        jwt.verify(data.token, process.env.secretkey, async (err, authData) => {
            if (err) {
                socket.send({
                    status: false,
                    message: responseMessages.USER_DATA_INVALID
                });
            } else {
                data.user_id = authData.user_id;
                data.message = "Face ID will be created shortly. Get ready and smile!";
                io.emit('web_trigger_face_id', data);
                setTimeout(async () => {
                    data.message = "Processing images. Keep smiling!";
                    io.emit('web_trigger_face_id', data);
                    await utils.storeFaceDataset(config.uuid, authData.user_id).then(() => {
                        data.message = "";
                        io.emit('web_trigger_face_id', data);
                    });
                }, 10);
            }
        });
    });

    socket.on('app_update_widgets', function (data) {
        jwt.verify(data.token, process.env.secretkey, async (err, authData) => {
            if (err) {
                socket.send(({
                    status: false,
                    message: responseMessages.USER_NOT_AUTHORIZED
                }))
            } else {
                const user_id = authData.user_id;
                let response = await usersCollectionUtils.updateUserWidgets(user_id, data.widget_name, data.previous_slot, data.slot);
                io.emit('web_update_widgets', {
                    user_id: user_id
                });
                socket.send(response);
            }
        });
    })


};