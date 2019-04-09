/**
 * Utility functions to:
 * - Verify Tokens sent with HTTP Requests
 * - Initialize Connection to the system webcam
 * - Capture Images with the system webcam
 * - Send captured Images to the external server used for facial recognition to save them
 * - Send captured Images to the external server used for facial recognition to recognize faces
 * - Execute camera functions to create a dataset on the external server
 * - Initialize server addressess when working on MacOS
 */

const fs = require('fs-extra');
const os = require('os');
const uuidv1 = require('uuid/v1');
const TRAIN_IMAGE_NUMBER = 100;

var config = require('./config'); // config file for IP Addresses and Mirror UUID
const responseMessages = require('./responseMessages');
const macCameraManager = require("./macCameraManager");
const piCameraManager = require("./piCameraManager"); // Standard response messages for HTTP requests websocket messages

/**
 * Function to verify session tokens sent with HTTP requests
 * @param req Request Object of the request
 * @param res Result Object of the request
 * @param next Function to be executed after token has been verified
 */
function verifyToken(req, res, next) {
    const bearerHeader = req.headers.authorization;
    // If token has been set get token and save in request object
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        // Send Error message when no token is available
        res.json({
            status: false,
            message: responseMessages.USER_NOT_AUTHORIZED
        });
    }
}

/**
 * Function to execute the above function in a loop to create a face dataset
 * @param mirror_uuid
 * @param userId
 * @returns {Promise<any>} Returns JSOB object with response from the called functions
 */
async function triggerStoreFaceDataset(mirror_uuid, userId) {
    let response;
    switch(os.platform()) {
        case 'darwin':
            response = await macCameraManager.storeFaceDataset(mirror_uuid, userId);
            break;
        case 'linux':
            response = await piCameraManager.storeFaceDataset(mirror_uuid, userId);
            break;
    }
    return response;
}

async function triggerFaceRecognition(mirror_uuid) {
    let response;
    switch(os.platform()) {
        case 'darwin':
            response = await macCameraManager.recognizeImage(mirror_uuid);
            break;
        case 'linux':
            response = await piCameraManager.takeImage(mirror_uuid);
            break;
    }
    return response;
}

/**
 * Initializing server routine for MacOS
 * Fill config.json with the current ip address of the server and external server
 * add uuid to config.json if not already available
 * @param port to set server address correctly
 */
function initMacServer(port) {
    let ip_host;
    let ifaces = os.networkInterfaces();

    // Extract IPv4 addresses from network interfaces
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;
        ifaces[ifname].forEach(function (iface) {
            // If not an IPv4 address do nothing
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }
            // If multiple IPv4 addresses, output an error
            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                console.log("[WARNING]: This system has multiple IPv4 addresses.")
                console.log(ifname + ':' + alias, iface.address);
            } else { // Else save IPv4 address to save in config.json later
                ip_host = iface.address;
            }
            ++alias;
        });
    });
    // Set config fields to the respective ip addresses and ports
    config.ip_host = ip_host;
    config.django_address = 'http://localhost:8000';
    config.host_address = 'http://' + ip_host + ':' + port;
    if (!config.uuid) config.uuid = uuidv1(); // Create new UUID if this has not been set
    fs.writeFileSync('./config.json', JSON.stringify(config)); // Save new config JSON object in JSON file
}

module.exports = {
    verifyToken,
    triggerStoreFaceDataset,
    triggerFaceRecognition,
    initMacServer
}