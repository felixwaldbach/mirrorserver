const express = require('express');
const app = express();

const port = process.env.PORT || 5000;

var http = require('http').Server(app);
var io = require('socket.io')(http);

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
});

http.listen(port, () => console.log(`Listening on port ${port}`));
