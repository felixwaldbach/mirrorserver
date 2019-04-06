/**
 * MQTT Broker starting routine and topic message handlers
 * Attaches the MQTT server to the provided http server object
 */

const jwt = require('jsonwebtoken');
const mosca = require('mosca');
const os = require('os');

const utils = require('./utils'); // general utility functions
const config = require('./config'); // config file for IP Addresses and Mirror UUID
const usersCollectionUtils = require('./database/usersCollectionUtils'); // config file for IP Addresses and Mirror UUID

var mqttServer = new mosca.Server({}); // Create MQTT Server instance with mosca

var processingFaceRecognition = false;

function start(http, io) {
    mqttServer.attachHttpServer(http);

    /**
     * Message: ready
     * Parameters: -
     * Function: Is called whenever the MQTT Broker starts running
     */
    mqttServer.on('ready', function () {
        console.log('Mosca MQTT server is up and running');
    });

    /**
     * Message: clientConnected
     * Parameters: id: Client id of the connected client
     * Function: Called whenever a new MQTT Client connects to this Broker
     */
    mqttServer.on('clientConnected', function (client) {
        console.log('client connected: ' + client.id);
    });


    /**
     * Message: published
     * Parameters: packet: Object sent to the topic containing the payload, client: client that sent the message
     * Function: Called whenever a message is published to a topic
     */
    mqttServer.on('published', async function (packet, client) {
        // Switch-Case Statement to handle incoming topic paths
        console.log(packet.topic + ", " + packet.payload.toString('utf8'));

        switch (packet.topic) {
            // Incoming temperature data from the DHT22
            case 'indoor/dht22/send/temperature':
                io.emit('indoor_dht22_temperature', packet.payload.toString('utf8')); // send payload as socket message
                break;
            // Incoming temperature data from the DHT22
            case 'outdoor/dht22/send/temperature':
                io.emit('outdoor_dht22_temperature', packet.payload.toString('utf8')); // send payload as socket message
                break;
            // Incoming PIR motion data from the PIR
            case 'indoor/pir/send/motion':
                // Check if a motion has been detected
                if (packet.payload.toString('utf8') == "1") { // If Motion detected, trigger Face Recognition Session Creation algorithms
                    if (processingFaceRecognition) break;
                    processingFaceRecognition = true;
                    let response = await utils.initializeWebcam(os.platform()); // Initialize webcam object based on OS
                    response = await utils.takeImage(response.Webcam, os.platform(), 0, config.uuid); // take an image of the current scene
                    response = await utils.recognizeImage(config.uuid, response.base64); // send image to the external server for face recognition
                    // Check if a user was detected on the image
                    if (response.userId && response.userId !== 'unknown') { // If a user was detected, start session and create webtoken
                        let user = await usersCollectionUtils.getUserData(response.userId);
                        if (JSON.parse(user).user_data) {
                            jwt.sign({
                                userId: response.userId
                            }, process.env.secretkey, (err, token) => {
                                io.emit('handle_session', { // Send token and userId as socket message
                                    token: token,
                                    userId: response.userId,
                                    motion: packet.payload.toString('utf8')
                                });

                                mqttServer.publish({
                                    topic: 'indoor/pir/receive/timeout',
                                    payload: 'true',
                                    qos: 0,
                                    retain: false
                                })
                                processingFaceRecognition = false
                            });
                        } else {
                            console.log("No real user identified. No user Profile will be loaded.")

                            // If no user recognized, send empty user id as socket message
                            io.emit('handle_session', {
                                userId: null,
                                motion: '0'
                            });

                            mqttServer.publish({
                                topic: 'indoor/pir/receive/timeout',
                                payload: 'false',
                                qos: 0,
                                retain: false
                            })
                            processingFaceRecognition = false
                        }
                    } else { // If no user recognized, send empty user id as socket message
                        io.emit('handle_session', {
                            userId: null,
                            motion: '0'
                        });

                        mqttServer.publish({
                            topic: 'indoor/pir/receive/timeout',
                            payload: 'false',
                            qos: 0,
                            retain: false
                        })
                        processingFaceRecognition = false
                    }
                } else { // If no motion detected, send empty user id as socket message
                    io.emit('handle_session', {
                        userId: null,
                        motion: '0'
                    });
                }
                break;
        }
    });
}

module.exports = {
    start
}