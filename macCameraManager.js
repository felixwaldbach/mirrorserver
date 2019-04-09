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
const request = require('request');
const fs = require('fs-extra');
const NodeWebcam = require("node-webcam");
const os = require('os');
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

/**
 * Function to initialize camera object used to take pictures
 * @param os Either darwin for MacOS or linux for Raspbian, used to determine which camera module to use
 * @returns {Promise<any>} Returns Camera object inside JSON object
 */
function initializeWebcam(os) {
    return new Promise(async (resolve, reject) => {
        let Webcam = NodeWebcam.create(mac_opts);

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
        // When on MacOS, use Mac camera to take image with mac opts
        await Webcam.capture(output, async function (err, data) {
            Webcam.clear();
            resolve({
                base64: data,
                filename: mirror_uuid + "-" + "temporary" + "-" + counter + ".png"
            });
        });
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
async function recognizeImage(mirror_uuid) {
    let response = await initializeWebcam(os.platform()); // Initialize webcam object based on OS
    response = await takeImage(response.Webcam, os.platform(), 0, config.uuid); // take an image of the current scene

    return new Promise(async (resolve, reject) => {
        await request.post(config.django_address + '/face/recognizeimage', {
            json: {
                mirror_uuid: mirror_uuid,
                image_base64: response.base64
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

module.exports = {
    recognizeImage,
    storeFaceDataset
}