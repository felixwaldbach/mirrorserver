#!/bin/bash
# chmod 777 launch.sh
# ./launch.sh

echo Starting Configuration Script for Smart Mirror


# Install jq for json
sjqInstaller="$(sudo apt-get install jq)"


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
	# New Configuration Process
	# Set IPs and uuid into JSON

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

# Start MongoDB


# Start application (React and Express Server)


# Start Browser in fullscreen
xdg-open http://localhost:3000 &
xdotool search --sync --onlyvisible --class "Firefox" windowactivate key F11

# EOF


