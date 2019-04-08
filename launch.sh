#!/bin/bash

echo "Starting Configuration Script for Smart Mirror..."

# some sleeping time till wifi connects
sleep 20

# check display rotation
display_rotation="$(grep "display_rotate" /boot/config.txt)"
if [ -z $display_rotation ]
then
	echo "display_rotation empty, setting now."
	sudo sh -c "echo 'display_rotate=1' >> /boot/config.txt"
	sudo reboot
else
	if [ $display_rotation == "display_rotate=1" ]
	then
		echo "Display rotation correct"
	else
		echo "Setting display rotation for all"
		sudo sed -i -e 's/display_rotate=0/display_rotate=1/g' /boot/config.txt
		sudo sed -i -e 's/display_rotate=2/display_rotate=1/g' /boot/config.txt
		sudo sed -i -e 's/display_rotate=3/display_rotate=1/g' /boot/config.txt
		sudo reboot
	fi
fi

#change to directory where the code folder is based
cd ~/Desktop


if [ $(ping -q -w 1 -c 1 `ip r | grep default | cut -d ' ' -f 3` > /dev/null && echo ok || echo error) == "ok" ]
then
	echo "Internet connection okay"

	# get ip...
	ip="$(hostname -I | awk '{print $1}')"
	ip="${ip//[[:space:]]/}"
	ip_router="${ip%.*}.1"
	ip_static="${ip%.*}.200"

	# setup static ip address
	static_ip_address="$(grep "static ip_address=" /etc/dhcpcd.conf)"
	static_routers="$(grep "static_routers=" /etc/dhcpcd.conf)"
	static_domain_name_servers="$(grep "static domain_name_servers=" /etc/dhcpcd.conf)"

	if [[ ($static_ip_address=$ip+"/24" || $static_routers=$ip_router+"/24" || $static_domain_name_servers=$ip_router) ]]
	then
		sudo rm -rf /etc/dhcpcd.conf

		echo "static ip empty or wrong, setting now."
		static_ip_address=$ip_static
		static_ip_address+="/24"
		static_routers=$ip_router
		static_domain_name_servers=$ip_router

		echo $static_ip_address
		echo $static_routers
		echo $static_domain_name_servers

		sudo touch /etc/dhcpcd.conf

		sudo sh -c "echo '# Static IP' >> /etc/dhcpcd.conf"
		sudo sh -c "echo 'static ip_address=$static_ip_address' >> /etc/dhcpcd.conf"
		sudo sh -c "echo 'static routers=$static_routers' >> /etc/dhcpcd.conf"
		sudo sh -c "echo 'static domain_name_servers=$static_domain_name_servers' >> /etc/dhcpcd.conf"
	else
		echo "static ip is fine..."
		echo $ip_router
		echo $ip_static
	fi

	# important package installations and updates
	sudo apt-get -y install jq
	sudo apt-get -y install dirmngr
	sudo apt-get -y install xdotool
	sudo apt-get -y install curl
	sudo apt-get -y install git
	sudo apt-get -y install mongodb


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
		sleep 3m
		cd client
		nohup npm install &
		# wait some time till installation of packages is done...
		sleep 8m
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

		ip="$(hostname -I | awk '{print $1}')"
		ip="${ip//[[:space:]]/}"

		# Set IP address of host and django server
		host_address="http://"
		django_address="http://"

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
	fi

	# Start express server and frontend
	echo "Starting Backend..."
	nohup node server.js &
	echo "Starting Frontend..."
	cd client
	nohup npm start &
	cd ~/Desktop


	# Start Browser in fullscreen
	echo "Opening Browser..."
	chromium-browser --start-fullscreen --disable-session-crashed-bubble --disable-infobars http://localhost:3000 &
	#xdg-open http://localhost:3000 &
	sleep 30
	xdotool key "F11" &


else
	echo "No Internet connection"
	sleep 60
	sudo reboot
fi

exec bash
# EOF
