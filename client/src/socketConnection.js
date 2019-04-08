import io from 'socket.io-client';

export const socket = io.connect('http://127.0.0.1:5000')
