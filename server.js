/**
 * Main entry point of the application, creating the http server and setting everything up
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const os = require('os');
const qr = require('qr-image');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 5000; // Port on which the HTTP Server listens

// Routers for incoming HTTP requests
var apiRouter = require('./routes/api'); // Incoming requests from the Frontend React App
var nativeRouter = require('./routes/native'); // Incoming requests from the Smartphone React-Native App

var config = require('./config'); // config file for IP Addresses and Mirror UUID
const utils = require('./utils'); // general utility functions

const mqttServer = require('./mqttServer'); // MQTT Server

const app = express(); // Create a new express instance
const http = require('http').Server(app); // Wrap HTTP Server around express instance
const io = require('socket.io')(http); // Wrap Socket IO Websocket Server around HTTP Server

app.use("/public", express.static(__dirname + '/public')); // Make public folder accessible via HTTP requests

require('dotenv').load(); // Loads environment variables from .env file

app.use(bodyParser.json()); // only parse JSON
app.use(cors());

// Using routers
app.use('/api', apiRouter);
app.use('/native', nativeRouter);

// Adding Socket Event Handlers to the Socket IO Server
io.on('connection', function (socket) {
    console.log('a user has connected');
    socket.send('test', {
        message: 'test'
    })
    require('./socketEventHandlers')(socket, io);
});

// Starting MQTT Server
mqttServer.start(http, io);

// If OS is MacOS execute MacOS init function
if (os.platform() === 'darwin') {
    utils.initMacServer(port);
}

// Check if public folders are created. If not, do so
!fs.existsSync('./public') && fs.mkdirSync('./public');
!fs.existsSync('./public/savedQrCode') && fs.mkdirSync('./public/savedQrCode');
!fs.existsSync('./public/uploads') && fs.mkdirSync('./public/uploads');

// Generate QR Code with host ip address to be displayed in the frontend
var qr_svg = qr.image(config.host_address, {type: 'svg'});

var jsonPath = path.join(__dirname, '.', 'public', 'savedQrCode', 'qrcode.svg');
qr_svg.pipe(fs.createWriteStream(jsonPath));

// Bind HTTP Server to Port
http.listen(port, () => console.log(`Listening on port ${port}`));