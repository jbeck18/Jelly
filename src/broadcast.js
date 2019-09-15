import io from 'socket.io-client';
import utils from './utils';
import { handleMIDIEvent } from './midi-consumer';
import { Visualizer } from './visualizer';

console.log("creating socket...");

const params = utils.getParameters();
let socket = null;

const handleBroadcaster = function(key, data, room) {
    console.log("Broadcasting data to room: " + room);
    let d = [];
    for(let i = 0; i < data.length; i++) {
        d.push(data[i]);
    }
    d[1] = d[1] + '';
    socket.emit('broadcast', {room: room, event: d});
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
        socket = io('www.jelly.studio', { query: { room: params.room }, path: '/redis/socket.io' });
        socket.on('message', function(data) {
            console.log('Message received: ' + data);
        });
        socket.on('connect', function() {
            socket.emit('join', {room: params.room});
            console.log('Connected to redis server');
        });

        if(params.isbroadcaster === "true") {
            
        } else {
            socket.emit('subscribe', {room: params.room});
            console.log("Subscribed to broadcast...");
            socket.on('broadcastMIDIEvent', function(data) {
                const midi = Array.of(JSON.parse(data)['data']);
                const res = midi[0].replace('[', '').replace(']', '').replace('\"', '').split(',').map((element => parseInt(element.trim(), 10)));
                res[1] = res[1] + '';
                console.log(res);
                Visualizer.handleEvent(document.getElementById(res[1]), res);
            });
        }
    }
};

export const Broadcaster = {
    handleEvent: (key, data) => handle(key, data),
    setup: () => setup()
};