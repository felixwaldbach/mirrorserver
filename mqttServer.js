const jwt = require('jsonwebtoken');
const mosca = require('mosca');
const os = require('os');

var mqttServer = new mosca.Server({});

const utils = require('./utils');
const config = require('./config')

function start(http, io) {
    mqttServer.attachHttpServer(http);

    // MQTT
    mqttServer.on('clientConnected', function (client) {
        console.log('client connected: ' + client.id);
    });

    mqttServer.on('ready', function () {
        console.log('Mosca MQTT server is up and running');
    });

    // fired when a message is received
    mqttServer.on('published', async function (packet, client) {
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
                    let response = await utils.initializeWebcam(os.platform());
                    response = await utils.takeImage(response.Webcam, os.platform(), 0, config.uuid);
                    response = await utils.recognizeImage(config.uuid, response.base64);

                    if (response.user_id) {
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
                        console.log("Face recognition did not work: " + JSON.stringify(response));
                        io.emit('handle_session', {user_id: null, motion: "0"});     // kill session because error happened, try again in 3 minutes...
                    }
                } else {
                    // kill session because no one is in front of the mirror
                    io.emit('handle_session', {user_id: null, motion: packet.payload.toString('utf8')});
                }
                break;
        }
    });
}

module.exports = {
    start
}