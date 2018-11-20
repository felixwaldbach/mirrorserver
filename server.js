const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const database = require('./database');

const port = process.env.PORT || 5000;

var http = require('http').Server(app);
var io = require('socket.io')(http);
var shell = require('shelljs');

const currentUser = "Emre";
const mongoURL = 'mongodb://127.0.0.1:27017/smartmirror';

require('dotenv').load();

// Body parser to decode incoming json
app.use(bodyParser.json());

app.get('/api/hello', (req, res) => {
    res.send({express: 'Hello From Express'});
});


// HTTP Requests
// Register, check user credentials and create user with jwt
app.post('/native/signup', (req, res)  => {
  MongoClient.connect(mongoURL, { useNewUrlParser: true }, function(err, client) {
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
  res.send("ok");
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
            io.emit('five_day_forecast', { forecast: stdout});
        });
    });

    // Quotes Widget
    // Send random quotes to UI. Use CURL and GET
    socket.on('send_quotes', function (data) {
        shell.exec("curl -H Accept:application/json -H Content-Type:application/json -X GET https://talaikis.com/api/quotes/random/", function (code, stdout, stderr) {
            io.emit('new_quotes', { randomQuote: stdout});
        });
    });
});

http.listen(port, () => console.log(`Listening on port ${port}`));
