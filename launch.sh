#!/bin/bash

# This script is in the mirrorserver repository just to distribute the launch script.
# node.js needs to be installed already...

echo "Starting Configuration Script for Smart Mirror..."

# check display rotation
display_rotation="$(grep "display_rotate" /boot/config.txt)"
if [ $display_rotation == "display_rotate=1" ]
then
	echo "Display rotation correct"
else
	echo "Display rotation wrong, setting up..."
	if [ -z $display_rotation ]
	then
		echo "Setting display rotation"
		sudo echo display_rotate=1 >> /boot/config.txt
	else
		echo "Setting display rotation"
		sudo sed -i -e 's/display_rotate=0/display_rotate=1/g' /boot/config.txt
		sudo sed -i -e 's/display_rotate=2/display_rotate=1/g' /boot/config.txt
		sudo sed -i -e 's/display_rotate=3/display_rotate=1/g' /boot/config.txt
	fi
	sudo reboot
fi


#change to directory where the code folder is based
cd ~/Desktop


if [ $(ping -q -w 1 -c 1 `ip r | grep default | cut -d ' ' -f 3` > /dev/null && echo ok || echo error) == "ok" ]
then
	echo "Internet connection okay"


	# important package installations
	sudo apt-get install jq
	sudo apt-get install dirmngr
	sudo apt-get install xdotool
	sudo apt-get install curl
	sudo apt-get install git
	sudo apt-get install mongodb


	# check if project exists: yes = direct to that folder, no = git clone
	if [ -d "mirrorserver" ];
	then
		echo "Project mirrorserver exists!"
	else
		echo "Project mirrorserver does not exists!"
		git clone https://github.com/felixwaldbach/mirrorserver.git
		cd mirrorserver
		nohup npm install &
		# wait some time till installation of packages is done...
		sleep 2m
		cd client
		nohup npm install &
		# wait some time till installation of packages is done...
		sleep 2m
	fi

	# change to project directory
	cd ~/Desktop/mirrorserver

	echo "Setting up database"
	node mongoWidgetScript.js

	# check if .env for environment variables exists
	if [ -e .env ]
	then
		echo ".env exists!"
	else
		echo ".env does not exist, creating now...!"
		$(touch .env)
		secretkey="secretkey="
		key=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 100 | head -n 1)
		secretkey+=$key
		echo $secretkey >> .env
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


	if [ "$configIsEmpty" = true ]
	then
		echo "Setting up new config.json..."
		# Set static IP
		# Not working yet, not supported???

		# Set IP address of host and django server
		host_address="http://"
		django_address="http://"

		ip="$(hostname -I | awk '{print $1}')"
		ip="${ip//[[:space:]]/}"

		host_address+=$ip
		django_address+="192.169.172.20"

		host_address+=:5000
		django_address+=:8000

		uuid=$(cat /proc/sys/kernel/random/uuid)

		echo $host_address
		echo $django_address
		echo $uuid

		# write this new configuration into config.json which is created before

		configuration=$( jq -n \
	                  --arg ip "$ip" \
	                  --arg bn "$host_address" \
	                  --arg on "$django_address" \
	                  --arg tl "$uuid" \
	                  '{ip_host: $ip, host_address: $bn, django_address: $on, uuid: $tl}' )

		echo $configuration > config.json
	else
		# check for IPs and uuid
		echo $config

	# Start express server and frontend
	echo "Starting Application..."
	nohup node server.js &
	cd client
	nohup npm start &
	cd ~/Desktop


	# Start Browser in fullscreen
	echo "Opening Browser..."
	chromium-browser --start-fullscreen &
	xdg-open http://localhost:3000 &
	sleep 5
	xdotool key "F11" &


fi

###

	else
		echo "No Internet connection"
		node wifiManager.js
fi

exec bash
# EOF
