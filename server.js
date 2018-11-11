const express = require('express');
const app = express();

const port = process.env.PORT || 5000;

var http = require('http').Server(app);
var io = require('socket.io')(http);
var shell = require('shelljs');

const currentUser = "Emre";

app.get('/api/hello', (req, res) => {
    res.send({express: 'Hello From Express'});
});

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.send('testFromApi', {
        message: 'Hello World'
    });

    socket.on('message', function (data) {
        console.log(data);
    });

    // QuotesWidget.js
    // Send random quotes to UI. Use CURL and GET
    socket.on('send_quotes', function (data) {
        console.log(data);
        shell.exec("curl -H Accept:application/json -H Content-Type:application/json -X GET https://talaikis.com/api/quotes/random/", function (code, stdout, stderr) {
            io.emit('new_quotes', { randomQuote: stdout});
        });
    });
});

http.listen(port, () => console.log(`Listening on port ${port}`));
