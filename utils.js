const responseMessages = require('./responseMessages');
const RaspiCam = require('raspicam');
const config = require('./client/src/config');
const request = require('request');
const fs = require('fs-extra');
const NodeWebcam = require("node-webcam");

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

const pi_opts = {
    mode: 'photo',
    encoding: 'png',
    output: './temporary.png',
    width: 640,
    height: 360,
    quality: 100,
    timeout: 10,
    verbose: false,
    nopreview: true
};

// for jsonwebtoken and session, verifies session token
function verifyToken(req, res, next) {
    const bearerHeader = req.headers.authorization;
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.json({
            message: responseMessages.USER_NOT_AUTHORIZED
        });
    }
}

function initializeWebcam(user_id, os) {
    return new Promise(async (resolve, reject) => {
        let Webcam;
        if (os === 'darwin') Webcam = NodeWebcam.create(mac_opts);
        else if (os === 'linux') Webcam = new RaspiCam(pi_opts);
        if (!fs.existsSync("./public/uploads/" + user_id)) {
            await fs.mkdirSync("./public/uploads/" + user_id);
        }
        resolve({
            Webcam: Webcam
        });
    });
}

function takeImage(Webcam, os, counter, mirror_uuid, user_id) {
    return new Promise(async (resolve, reject) => {
        if (os === 'darwin') await Webcam.capture("./public/uploads/" + user_id + "/temporary_camera_picture" + counter + ".png", async function (err, data) {
            await fs.removeSync("./public/uploads/" + user_id);
            Webcam.clear();
            resolve({
                base64: data,
                name: mirror_uuid + "-" + user_id + "-" + counter + ".png"
            });
        });
        else if (os === 'linux') {
            await Webcam.start();
            let bitmap = await fs.readFileSync('./public/uploads/temporary_recognition_image.png');
            let data = new Buffer(bitmap).toString('base64');
            fs.unlink('./public/uploads/temporay_recognition_image.png', (err) => {
                if (err) throw err;
            });
            resolve({
                base64: data,
                name: mirror_uuid + '-' + user_id + '-' + counter + '.png'
            })
        }
    });
}

function sendImageToServer(base64, name, mirror_uuid, user_id) {
    return new Promise(async (resolve, reject) => {
        await request.post(config.DJANGO_SERVER_ADDRESS + ':' + config.DJANGO_SERVER_PORT + '/face/storetrain', {
            json: {
                mirror_uuid: mirror_uuid,
                user_id: user_id,
                base64: base64,
                name: name,
                last_image: name.replace('.png', '').endsWith(config.TRAIN_IMAGE_NUMBER) ? true : false
            }
        }, (error, django_response, body) => {
            resolve({
                error: error,
                django_response: django_response,
                body: body
            });
        });
    });
}

function recognizeImage(mirror_uuid, base64) {
    return new Promise(async (resolve, reject) => {
        await request.post(config.DJANGO_SERVER_ADDRESS + ':' + config.DJANGO_SERVER_PORT + '/face/recognizeimage', {
            json: {
                mirror_uuid: mirror_uuid,
                image_base64: base64
            }
        }, (error, django_response, body) => {
            if (error) {
                resolve({
                    status: false,
                    message: responseMessages.FACE_RECOGNITION_ERROR
                })
            }
            resolve(body);
        });
    });
}

module.exports = {
    verifyToken,
    initializeWebcam,
    takeImage,
    sendImageToServer,
    recognizeImage
}