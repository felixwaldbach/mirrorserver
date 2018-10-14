const express = require('express');
const cors = require('cors');

const app = express();

const port = process.env.PORT || 5000;

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/api/hello', (req, res) => {
    res.send({express: 'Hello From Express'});
});

io.on('connection', function (socket) {
    console.log('a user connected: ' + socket.id);

    socket.on('message', function (data) {
      console.log(data);
    });
});

io.on('test', function (message) {
    console.log("Message received");
    console.log(message);
});

http.listen(port, () => console.log(`Listening on port ${port}`));
