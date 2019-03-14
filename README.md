# mirrorserver

## What does this Repository contain?
This repository holds code for the Smart Mirror Backend and Frontend. This application is implemented with the MERN Stack

## Setup the Raspberry Pi:
Make sure the Raspberry Pi has a Wi-Fi connection and you have installed these application:
```
- Node.js
- MongoDB (& dirmngr)
- xdotool
- curl
- git
- jq
```

Then make sure that you have configured the Raspberry Pi with a static IP address:
```
sudo nano /etc/dhcpcd.conf

interface wlan0
static ip_address=192.168.x.x/24
static routers=192.168.x.1
static domain_name_servers=192.168.x.1

Save & Reboot

Important! Do not touch /etc/network/interfaces
```

## Backend
The backend is written in Express and Node.js. It is distributed on a Raspberry Pi which runs the MongoDB database and establishes a REST, Socket.io and Broker connectivity.

## Frontend
The Frontend is written in React.js and shows the personalized Smart Mirror widgets using face recoginition.

## Getting started
First of all, ensure to have a running MERN environment.
Clone this package and run this:

```
1. cd mirrorserver
2. npm install
3. node server.js
4. cd client
5. npm install
6. npm start
```

## Contributors
This project is developed and maintained by [Emre Besogul](https://github.com/emrebesogul) and [Felix Waldbach](https://github.com/felixwaldbach).
For questions reach out to us!
