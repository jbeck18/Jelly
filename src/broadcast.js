import io from 'socket.io-client';
import utils from './utils';
import { handleMIDIEvent } from './midi-consumer';

console.log("creating socket...");

const params = utils.getParameters();
let socket = null;

document.getElementById('join-broadcast').onclick = function(e) {
    window.location.search = `?room=${document.getElementById('broadcast-channel-join').value}`;
};

document.getElementById('start-broadcast').onclick = function(e) {
    window.location.search = `?room=${document.getElementById('broadcast-channel-start').value}&isBroadcaster=true`;
};

const handleBroadcaster = function(key, data, room) {
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
                data['data'][1] = parseInt(data['data'][1], 10);
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
