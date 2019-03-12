#!/bin/bash

echo "Starting Configuration Script for Smart Mirror..."


# Installations for Smart Mirror: jq, git, nodejs, mongodb, gnome-terminal, uuidgen


# rotate display, problem: needs reboot
# rotate_display = 3


# change to directory where the code folder is based
$(cd ~/Desktop)


# check if project exists: yes = direct to that folder, no = git clone
if [ -d "mirrorserver" ];
then
	echo "Project mirrorserver exists!"
	# change to project directory
	$(cd ~/Desktop/smartmirror)
else
	echo "Project mirrorserver does not exists!"
	# clone repo (master) folder from git
	$(git clone https://github.com/felixwaldbach/mirrorserver.git)
	gnome-terminal --working-directory=/home/emre/Desktop/mirrorserver -- npm install . &
	gnome-terminal --working-directory=/home/emre/Desktop/mirrorserver/client -- npm install . &
	# wait till installation of packages is done...
	sleep 2m
fi


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
	ip_address_host="$(hostname -I)"
	ip_address_django="$(hostname -I)"

	ip_address_host+=:5000
	ip_address_django+=:5000

	ip_address_host="${ip_address_host//[[:space:]]/}"
	ip_address_django="${ip_address_django//[[:space:]]/}"

	uuid=$(uuidgen)

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


# Start database: sudo service mongod start OR sudo service mongod stop
echo "Starting MongoDB..."
mongod="sudo service mongod start"
$mongod


# Start express server and frontend
echo "Starting Application..."
gnome-terminal --working-directory=/home/emre/Desktop/mirrorserver -- node server.js . &
gnome-terminal --working-directory=/home/emre/Desktop/mirrorserver/client -- npm start . &


# Start Browser in fullscreen
xdg-open http://localhost:3000 &
xdotool search --sync --onlyvisible --class "Firefox" windowactivate key F11


# EOF
