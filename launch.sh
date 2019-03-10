#!/bin/bash

echo Starting Configuration Script for Smart Mirror

# change to directory where the code is based...
$(cd ~/Desktop)

# Installations for Smart Mirror
# Nodejs
$(sudo apt-get update)
$(curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash –)
$(sudo apt-get install -y nodejs)

# JQ
$(sudo apt-get install jq)

# Git
$(sudo apt-get install git)

# MongoDB
$(sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4)
$(echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list)
$(sudo apt-get update)
$(sudo apt-get install -y mongodb-org)

# check if config.json exists
if [ -e config.json ]
then
	echo config file exists
	config="$(cat config.json | jq '.')"
else
	echo config file does not exist, creating now...
	$(touch config.json)
fi

# check if file has content
if [ -z "$config" ]
then
	echo config file is empty
	configIsEmpty=true
else
	echo config file is not empty
	configIsEmpty=false
fi

echo $configIsEmpty

if [ "$configIsEmpty" = true ]
then
	echo New Configuration Process
	# Set static IP
	# Not working yet, not supported???

	# Set IP address of host and django server
	ip_address_host="$(hostname -I)"
	ip_address_django="$(hostname -I)"

	ip_address_host+=:5000
	ip_address_django+=:5000

	ip_address_host="${ip_address_host//[[:space:]]/}"
	ip_address_django="${ip_address_django//[[:space:]]/}"

	echo $ip_address_host
	echo $ip_address_django

	uuid=$(uuidgen)
	echo $uuid

	# write this new configuration into config.json which is created before

	configuration=$( jq -n \
                  --arg bn "$ip_address_host" \
                  --arg on "$ip_address_django" \
                  --arg tl "$uuid" \
                  '{ip_host: $bn, ip_django: $on, uuid: $tl}' )

	echo $configuration > config.json
else
	# check for IPs and uuid
	echo $config
fi

# MongoDB command: sudo service mongod start OR sudo service mongod stop
echo "Start MongoDB."
mongod="sudo service mongod start"
$mongod

# Start application (React and Express Server)
if [ -d "mirrorserver" ];
then
	echo project exists
else
	echo project does not exists
	$(git clone https://github.com/felixwaldbach/mirrorserver.git)
	gnome-terminal --working-directory=/home/emre/Desktop/mirrorserver -- npm install . &
	gnome-terminal --working-directory=/home/emre/Desktop/mirrorserver/client -- npm install . &
	# wait till installation of packages is done...
	sleep 2m
fi

gnome-terminal --working-directory=/home/emre/Desktop/mirrorserver -- node server.js . &
gnome-terminal --working-directory=/home/emre/Desktop/mirrorserver/client -- npm start . &

# Start Browser in fullscreen
xdg-open http://localhost:3000 &
xdotool search --sync --onlyvisible --class "Chromium" windowactivate key F11

# EOF
