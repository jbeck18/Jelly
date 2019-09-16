import io from 'socket.io-client';
import utils from './utils';
import { handleMIDIEvent } from './midi-consumer';
import { Visualizer } from './visualizer';

console.log("creating socket...");

const params = utils.getParameters();
let socket = null;

const handleBroadcaster = function(key, data, room) {
    // console.log("Broadcasting data to room: " + room);
    let d = [];
    for(let i = 0; i < data.length; i++) {
        d.push(data[i]);
    }
    d[1] = d[1] + '';

    const time = new Date().getTime();


    socket.emit('broadcast', {room: room, event: d, time: time});
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
                const offset = 1200 - (new Date().getTime() - data['time']);
                console.log(offset);
                console.log(data['data']);
                setTimeout(function() {
                    handleMIDIEvent(data['data']);
                }, offset);
            });
        }
    }
};

export const Broadcaster = {
    handleEvent: (key, data) => handle(key, data),
    setup: () => setup()
};