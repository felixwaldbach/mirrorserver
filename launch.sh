#!/bin/bash

# This script is in the mirrorserver repository just to distribute the launch script.

echo "Starting Configuration Script for Smart Mirror..."


# rotate display, problem: needs reboot
# rotate_display = 3


# change to directory where the code folder is based
cd ~/Desktop


# check if project exists: yes = direct to that folder, no = git clone
if [ -d "mirrorserver" ];
then
	echo "Project mirrorserver exists!"
else
	echo "Project mirrorserver does not exists!"
	# clone repo (master) folder from git
	$(git clone https://github.com/felixwaldbach/mirrorserver.git)
	cd mirrorserver
	nohup npm install &
	cd client
	nohup npm install &
	#gnome-terminal --working-directory=/home/emre/Desktop/mirrorserver -- npm install . &
	#gnome-terminal --working-directory=/home/emre/Desktop/mirrorserver/client -- npm install . &
	# wait some time till installation of packages is done...
	sleep 4m
fi


# change to project directory
cd ~/Desktop/mirrorserver


# check if config.json exists
if [ -e config.json ]
then
	echo "config.json exists!"
	config="$(cat config.json | jq '.')"
else
	echo "config.json does not exist, creating now...!"
	$(touch config.json)
fi


# check if config.json has content
if [ -z "$config" ]
then
	echo "config.json is empty!"
	configIsEmpty=true
else
	echo "config.json is not empty!"
	configIsEmpty=false
fi


echo $configIsEmpty


if [ "$configIsEmpty" = true ]
then
	echo "Setting up new config.json..."
	# Set static IP
	# Not working yet, not supported???

	# Set IP address of host and django server
	ip_address_host="$(hostname -I | awk '{print $1}')"
	ip_address_django="$(hostname -I | awk '{print $1}')"

	ip_address_host+=:5000
	ip_address_django+=:8000

	ip_address_host="${ip_address_host//[[:space:]]/}"
	ip_address_django="${ip_address_django//[[:space:]]/}"

	uuid=$(cat /proc/sys/kernel/random/uuid)

	echo $ip_address_host
	echo $ip_address_django
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


# Start express server and frontend
echo "Starting Application..."
nohup node server.js &
cd client
nohup npm start &
cd ~/Desktop

#gnome-terminal --working-directory=/home/emre/Desktop/mirrorserver -- node server.js . &
#gnome-terminal --working-directory=/home/emre/Desktop/mirrorserver/client -- npm start . &


# Start Browser in fullscreen
echo "Opening Browser..."
chromium-browser --start-fullscreen &
xdg-open http://localhost:3000 &
sleep 5
xdotool key "F11" &

exec bash
# EOF
