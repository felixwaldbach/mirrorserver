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

const RaspiCam = require('raspicam');
const request = require('request');
const fs = require('fs-extra');
const NodeWebcam = require("node-webcam");
const os = require('os');
const uuidv1 = require('uuid/v1');
const TRAIN_IMAGE_NUMBER = 100;

var config = require('./config'); // config file for IP Addresses and Mirror UUID
const responseMessages = require('./responseMessages'); // Standard response messages for HTTP requests websocket messages

// Camera Options for MacOS
const mac_opts = {
    width: 640,
    height: 360,
    quality: 100,
    saveShots: true,
    output: "png",
    device: false,
    callbackReturn: "base64",
    verbose: false
};

// Camera Options for Raspbian
var pi_opts = {
    mode: 'photo',
    encoding: 'png',
    width: 640,
    height: 360,
    quality: 100,
    timeout: 10,
    verbose: false,
    nopreview: true
};

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
 * Function to initialize camera object used to take pictures
 * @param os Either darwin for MacOS or linux for Raspbian, used to determine which camera module to use
 * @returns {Promise<any>} Returns Camera object inside JSON object
 */
function initializeWebcam(os) {
    return new Promise(async (resolve, reject) => {
        let Webcam;
        if (os === 'darwin') Webcam = NodeWebcam.create(mac_opts);
        else if (os === 'linux') Webcam = new RaspiCam(pi_opts);

        // If not already existing, create a temporary folder to store the taken images temporarily
        if (!fs.existsSync("./public/uploads/temporary")) {
            await fs.mkdirSync("./public/uploads/temporary");
        }
        resolve({
            Webcam: Webcam
        });
    });
}

/**
 * Function to take image based on the existing operating system
 * @param Webcam Webcam object created earlier
 * @param os Operating System where image is taken on, either darwin for MacOS or linux for Raspbian
 * @param counter Used to append a number to the image name
 * @param mirror_uuid Used to name the file accordingly before sending it to the external face recognition server
 * @returns {Promise<any>} Returns JSON object containing the taken and base64 encoded image and the filename
 */
function takeImage(Webcam, os, counter, mirror_uuid) {
    return new Promise(async (resolve, reject) => {
        let output = "./public/uploads/temporary/temporary_camera_picture" + counter + ".png"; // File path where image will be saved
        if (os === 'darwin') {
            // When on MacOS, use Mac camera to take image with mac opts
            await Webcam.capture(output, async function (err, data) {
                Webcam.clear();
                resolve({
                    base64: data,
                    filename: mirror_uuid + "-" + "temporary" + "-" + counter + ".png"
                });
            });
        }
        // When on Raspbian, use RPi camera to take image with pi opts
        else if (os === 'linux') {
            pi_opts.output = output
            await Webcam.start(); // automatically takes image and stores it in output filename
            let bitmap = await fs.readFileSync(output);
            let data = new Buffer(bitmap).toString('base64'); // Convert image to base64
            fs.unlink(output, (err) => {
                if (err) throw err;
            }); // delete file after converting image to base64
            resolve({
                base64: data,
                filename: mirror_uuid + '-' + "temporary" + '-' + counter + '.png'
            })
        }
    });
}

/**
 * Function to send an image to the external server with HTTP Post Request to store it
 * @param base64 Image base64 string
 * @param filename file name to save the image on the server
 * @param mirror_uuid to store image in correct mirror folder
 * @param userId to store image in correct user folder inside the mirror folder
 * @returns {Promise<any>} returns JSON object with error, response and body sent back from the external server
 */
function sendImageToServer(base64, filename, mirror_uuid, userId) {
    return new Promise(async (resolve, reject) => {
        await request.post(config.django_address + '/face/storetrain', {
            json: {
                mirror_uuid: mirror_uuid,
                userId: userId,
                base64: base64,
                filename: filename,
                lastImage: filename.replace('.png', '').endsWith(TRAIN_IMAGE_NUMBER)
            }
        }, async (error, django_response, body) => {
            if (error) {
                resolve({
                    status: false,
                    message: responseMessages.FACE_RECOGNITION_ERROR,
                    error: error
                });
            } else {
                if (body.lastImage) {
                    await fs.removeSync("./public/uploads/temporary");
                }
                resolve(body);
            }
        });
    });
}

/**
 * Function to send an image to the external server with HTTP Post Request for face recognition
 * @param mirror_uuid
 * @param base64
 * @returns {Promise<any>} Returns JSOB object with status, message, error and body data sent back from the external server
 */
function recognizeImage(mirror_uuid, base64) {
    return new Promise(async (resolve, reject) => {
        await request.post(config.django_address + '/face/recognizeimage', {
            json: {
                mirror_uuid: mirror_uuid,
                image_base64: base64
            }
        }, (error, django_response, body) => {
            if (error) {
                resolve({
                    status: false,
                    message: responseMessages.FACE_RECOGNITION_ERROR,
                    error: error
                })
            } else {
                resolve(body);
            }
        });
    });
}

/**
 * Function to execute the above function in a loop to create a face dataset
 * @param mirror_uuid
 * @param userId
 * @returns {Promise<any>} Returns JSOB object with response from the called functions
 */
async function storeFaceDataset(mirror_uuid, userId) {
    let response;
    for (let i = 1; i <= TRAIN_IMAGE_NUMBER; i++) {
        response = await initializeWebcam(os.platform());
        response = await takeImage(response.Webcam, os.platform(), i, mirror_uuid);
        response = sendImageToServer(response.base64, response.filename, mirror_uuid, userId);
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
    initializeWebcam,
    takeImage,
    recognizeImage,
    storeFaceDataset,
    initMacServer
}