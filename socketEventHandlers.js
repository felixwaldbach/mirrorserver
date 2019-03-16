/**
 * Event Handlers for the Socket IO Server created in entry file server.js
 */

const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

// Database Functions
const wunderlistCollectionUtils = require('./database/wunderlistCollectionUtils');
const weatherCollectionUtils = require('./database/weatherCollectionUtils');
const usersCollectionUtils = require('./database/usersCollectionUtils');

const config = require('./config'); // config file for IP Addresses and Mirror UUID
const utils = require('./utils'); // general utility functions
const responseMessages = require('./responseMessages'); // Standard response messages for HTTP requests websocket messages
const weatherIcons = require('./jsonModels/weatherIcons'); // Blueprint JSON Object for weather icons

/**
 * Function that is exported than this file is required
 * @param socket Socket Client Object
 * @param io Socket Server Object
 */
module.exports = function (socket, io) {

    /**
     * Plain message handler used for testing purposes
     */
    socket.on('message', function (data) {
        console.log(data)
    })

    /**
     * Weather forecast message handler
     */
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

    // Quotes Widget message handler
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

    // Wunderlist Settings message handler
    socket.on('send_wunderlist_settings', async function (data) {
        const response = await wunderlistCollectionUtils.sendCredentials(currentUser);
        io.emit('wunderlist_settings', response);
    });

    /**
     * Trigger face id message handler
     * Sent when a new face id is created
     * sends a status string to the frontend
     */
    socket.on('app_trigger_face_id', function (data) {
        jwt.verify(data.token, process.env.secretkey, async (err, authData) => {
            if (err) {
                // Send error message to client if not authorized
                socket.send({
                    status: false,
                    message: responseMessages.USER_DATA_INVALID
                });
            } else {
                data.user_id = authData.user_id;
                data.message = "Face ID will be created shortly. Get ready and smile!";
                io.emit('web_trigger_face_id', data); // Send new status string to frontend
                setTimeout(async () => {
                    data.message = "Processing images. Keep smiling!";
                    io.emit('web_trigger_face_id', data); // Send new status string to frontend
                    await utils.storeFaceDataset(config.uuid, authData.user_id).then(() => {
                        data.message = "";
                        io.emit('web_trigger_face_id', data); // Send new status string to frontend
                    }); // Create a new face dataset for the user on the external server
                }, 10); // Wait 10 seconds so the user in front of the mirror can get ready
            }
        });
    });

    /**
     * Update widgets message handler
     * Sent when a drag drop event is triggered in the Smartphone App
     */
    socket.on('app_update_widgets', function (data) {
        jwt.verify(data.token, process.env.secretkey, async (err, authData) => {
            if (err) {
                // Send error message to client if not authorized
                socket.send(({
                    status: false,
                    message: responseMessages.USER_NOT_AUTHORIZED
                }))
            } else {
                const user_id = authData.user_id;
                // update the user entry in the database with the new widget arrangement
                let response = await usersCollectionUtils.updateUserWidgets(user_id, data.widget_name, data.previous_slot, data.slot);
                io.emit('web_update_widgets', {
                    user_id: user_id
                }); // Send message to frontend to render new widgets for the authorized user
                socket.send(response);
            }
        });
    })


};