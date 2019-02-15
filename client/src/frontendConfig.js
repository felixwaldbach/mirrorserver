import io from 'socket.io-client';
import config from './config';

export const socket = io.connect("http://" + config.SERVER_ADDRESS + ":" + config.SOCKET_SERVER_PORT)