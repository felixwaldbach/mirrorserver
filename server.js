const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const uuidv1 = require('uuid/v1');

const os = require('os');
const qr = require('qr-image');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 5000;

var apiRouter = require('./routes/api');
var nativeRouter = require('./routes/native');
var config = require('./config');
const mqttServer = require('./mqttServer');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use("/public", express.static(__dirname + '/public'));

require('dotenv').load();

app.use(bodyParser.json());
app.use(cors());

app.use('/api', apiRouter);
app.use('/native', nativeRouter);

io.on('connection', function (socket) {
    console.log('a user has connected');
    require('./socketEventHandlers')(socket, io);
});

mqttServer.start(http, io);

if (os.platform() === 'darwin') {
    let ip_host;
    let ifaces = os.networkInterfaces();

    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                console.log("WARNING: This system has multiple IPv4 addresses.")
                console.log(ifname + ':' + alias, iface.address);
            } else {
                ip_host = iface.address;
            }
            ++alias;
        });
    });
    config.ip_host = ip_host;
    config.django_address = 'http://localhost:8000';
    config.host_address = 'http://' + ip_host + ':' + port;
    if (!config.uuid) config.uuid = uuidv1();
    fs.writeFileSync('./config.json', JSON.stringify(config));
}

var qr_svg = qr.image(config.host_address, {type: 'svg'});
var jsonPath = path.join(__dirname, '.', 'public', 'savedQrCode', 'qrcode.svg');
qr_svg.pipe(fs.createWriteStream(jsonPath));

http.listen(port, () => console.log(`Listening on port ${port}`));
