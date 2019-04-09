const RaspiCam = require('raspicam');
const fs = require('fs');
const request = require('request');
const TRAIN_IMAGE_NUMBER = 100;

// Camera Options for Raspbian
var pi_opts = {
    mode: 'timelapse',
    encoding: 'png',
    width: 640,
    height: 360,
    quality: 100,
    timeout: 75000,
    verbose: false,
    nopreview: true,
    output: 'output/test%d.png',
    timelapse: 750,
    sh: 100,
    br: 60
};

async function takeImage() {
    let Webcam = new RaspiCam(pi_opts);
    Webcam.on('read', async function(err, timestamp, filename) {
        console.log('READ');
        let bitmap = await fs.readFileSync('output/' + filename);
        let data = new Buffer(bitmap).toString('base64'); // Convert image to base64
        console.log('Sending ' + filename + '...');
        let response = await sendImageToServer(data, filename, 'test-uuid', 'test-user');
        /*fs.unlink('output/' + filename, (err) => {
            if (err) throw err;
        }); // delete file after converting image to bas
        */
    });

    Webcam.on('exit', async function(timestamp) {
        console.log('Taking pictures done');
        let bitmap = await fs.readFileSync('output/' + filename);
        let data = new Buffer(bitmap).toString('base64');
        let response = recognizeImage('test-uuid', 'output/' + filename);
    });
    let response = await Webcam.start(); // automatically takes image and stores it in output filename
}

async function takeImageTest() {
    let opts = {
        mode: 'photo',
        encoding: 'png',
        width: 640,
        height: 360,
        quality: 100,
        verbose: false,
        nopreview: true,
        output: 'output/reco.png',
        sh: 100,
        br: 60
    }
    let Webcam = new RaspiCam(opts);
    Webcam.on('exit', async function(timestamp) {
        console.log('Taking pictures done');
        let bitmap = await fs.readFileSync('output/reco.png');
        let data = new Buffer(bitmap).toString('base64');
        let response = recognizeImage('test-uuid', data);
    });
    let response = await Webcam.start(); // automatically takes image and stores it in output filename
}

function sendImageToServer(base64, filename, mirror_uuid, userId) {
    return new Promise(async (resolve, reject) => {
        await request.post('http://192.168.2.104:8000/face/storetrain', {
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
                    await fs.removeSync("./output");
                }
                resolve(body);
            }
        });
    });
}

function recognizeImage(mirror_uuid, base64) {
    return new Promise(async (resolve, reject) => {
        await request.post('http://192.168.2.104:8000/face/recognizeimage', {
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


//takeImage();
takeImageTest();

console.log('done now');