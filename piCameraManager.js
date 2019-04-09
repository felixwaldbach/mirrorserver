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
const TRAIN_IMAGE_NUMBER = 100;

var config = require('./config'); // config file for IP Addresses and Mirror UUID
const responseMessages = require('./responseMessages'); // Standard response messages for HTTP requests websocket messages

// Camera Options for Raspbian
var pi_opts_reco = {
    mode: 'photo',
    encoding: 'png',
    output: path.join(__dirname, '.', 'public', 'uploads', 'temporary', 'reco.png'),
    width: 640,
    height: 360,
    quality: 100,
    verbose: false,
    nopreview: true,
    sh: 100,
    br: 60
};

var pi_opts_train = {
    mode: 'timelapse',
    encoding: 'png',
    width: 640,
    height: 360,
    quality: 100,
    timeout: 75000,
    verbose: false,
    nopreview: true,
    output: path.join(__dirname, '.', 'public', 'uploads', 'temporary', 'train%d.png'),
    timelapse: 750,
    sh: 100,
    br: 60
};

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

async function takeImage(mirror_uuid) {
    return new Promise((resolve, reject) => {
        let Webcam = new RaspiCam(pi_opts_reco);
        let response;
        Webcam.on('exit', async function (timestamp) {
            let bitmap = await fs.readFileSync(path.join(__dirname, '.', 'public', 'uploads', 'temporary', 'train%d.png'));
            let data = new Buffer(bitmap).toString('base64');
            response = recognizeImage(mirror_uuid, data);
            resolve(response);
        });
        Webcam.start(); // automatically takes image and stores it in output filename
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
    let Webcam = new RaspiCam(pi_opts_train);
    let response;
    Webcam.on('read', async function (err, timestamp, filename) {
        let bitmap = await fs.readFileSync(path.join(__dirname, '.', 'public', 'uploads', 'temporary', filename));
        let data = new Buffer(bitmap).toString('base64'); // Convert image to base64
        response = await sendImageToServer(data, filename, mirror_uuid, userId);
        fs.unlink(path.join(__dirname, '.', 'public', 'uploads', 'temporary', filename), (err) => {
            if (err) throw err;
        }); // delete file after converting image to bas
    });

    Webcam.on('exit', async function (timestamp) {
        fs.removeSync(path.join(__dirname, '.', 'public', 'uploads', 'temporary'))
    });

    await Webcam.start(); // automatically takes image and stores it in output filename
    return response;
}

module.exports = {
    takeImage,
    storeFaceDataset
}