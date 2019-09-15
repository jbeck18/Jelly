import io from 'socket.io-client';
import utils from './utils';
import { handleMIDIEvent } from './midi-consumer';
import { Visualizer } from './visualizer';

console.log("creating socket...");

const params = utils.getParameters();
let socket = null;

const handleBroadcaster = function(key, data, room) {
    // console.log("Broadcasting data to room: " + room);
    socket.emit('broadcast', {room: room, event: data});
}

const handle = function(key, data) {
    if(typeof params.room === 'undefined') {
        return;
    }

    if(params.isbroadcaster === "true") {
        handleBroadcaster(key, data, params.room);
    }
};

const setup = function() {
    if(typeof params.room === 'undefined') {
        return;
    }
    if(socket === null) {
        socket = io.connect('https://jelly.studio');
        //socket = io.connect('localhost:4200');
        socket.on('message', function(data) {
            console.log('Message received: ' + data);
        });
        socket.on('connect', function() {
            socket.emit('join', {room: params.room});
            console.log('Connected to socket.io server');
        });

        if(params.isbroadcaster === "true") {
            
        } else {
            socket.on('broadcastMIDIEvent', function(data) {
                // console.log(data);
                Visualizer.handleEvent(document.getElementById(data[1]), data);
            });
        }
    }
};

export const Broadcaster = {
    handleEvent: (key, data) => handle(key, data),
    setup: () => setup()
};