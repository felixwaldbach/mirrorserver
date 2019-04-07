# mirrorserver

## What does this Repository contain?
This repository holds code for a Smart Mirror application using the Node.js MERN Stack. The project contains an Express Backend providing an HTTP Server, HTTP Request Handlers, a Socket.IO Server and an MQTT Server. It works with a MongoDB database and contains files to access a local MongoDB database.

It is designed to be configured by a React-Native Smartphone application we are currently building. [Go check it out!](https://github.com/emrebesogul/mirrorapp)

This project was created in the scope a selfmade smart mirror application we are currently building for university. It has only been tested on a 2017/2018 MacBook Pro so far and is developed on it mostly. It is designed on Raspberry Pi in the end

## Getting Started:
Follow these general steps to get this project running.
1. Install [Node](https://nodejs.org/en/), [NPM](https://www.npmjs.com/), [MongoDB](https://www.mongodb.com/)
2. Run an instance of MongoDB on port 27017 (default port)
3. Clone this Repo
4. ```cd mirrorserver && npm install```
5. ```cd client && npm install```
6. ```cd .. & npm run dev```

## Additional Steps for MacOS:
This project is developed and tested on MacOS mostly. In order to run it, follow these additional steps.
1. This project is using face recognition by accessing the camera through [node-webcam](https://www.npmjs.com/package/node-webcam). It only works after installing imagesnap (using brew):
```
brew imagesnap
```
When using one of the camera features for the first time, MacOS will ask for access to the camera. It has to be granted in order for this feature to work. If not granted, this feature will not work. Another tip: When taking cameras in front of the mirror, make sure to have right lighting and standing in front of the camera properly. The feature has not been tested with multiple people being in the camera scope so far. We are working on it!

## Additional Steps on a Raspberry Pi:
This project is designed to work on a Raspberry Pi

Make sure that you configure the Raspberry Pi with a static IP address. This is automatically done by the launch-script, but if it fails, take over manually:
```
sudo nano /etc/dhcpcd.conf

interface wlan0
static ip_address=192.168.x.x/24
static routers=192.168.x.1
static domain_name_servers=192.168.x.1

Save it by pressing Ctrl+X, " Y", ENTER & Re-boot

**Important! Do not touch /etc/network/interfaces**
```

Go to Desktop and run following:
```
cd Desktop
touch launch.sh
chmod 777 launch.sh
```

Then copy the content of launch.sh from Github...

The Raspberry Pi should also come with the launch.sh script on the Desktop. This script is setup as an auto script that runs after every boot automatically.
**This can be achieved by running following steps:**
```
sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
```
Add following line:
```
@lxterminal -e /home/pi/Desktop/launch.sh
```

Save it by pressing Ctrl+X, " Y", ENTER. Re-boot and the auto-script is setup. This will auto-run the launch.sh script after the Pi boot is finished and the GUI is loaded.


If executed correctly, an instance of the frontend will appear in your default browser in fullscreen listening on port 3000 after bootin the Pi. Launch.sh will first rotate your display for the mirror itself, then check your internet connection. If your Pi is not connected with the internet, another script should let you setup Wifi over the smartphone (not implemented yet, not planned, just documented for now!). If your Pi has internet access, the script will install important dependencies (nodejs, jq, mongodb, git, xdotool, curl and dirmngr), look for the Github repo on the Desktop and install its dependencies. Then it will configure the database, config.json and .env and launch the application in fullscreen in a browser.


## Contributors
This project is developed and maintained by [Emre Besogul](https://github.com/emrebesogul) and [Felix Waldbach](https://github.com/felixwaldbach).
For questions reach out to us!
