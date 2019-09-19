import io from 'socket.io-client';
import utils from './utils';

const params = utils.getParameters();
var socket = null;

var shouldRecord = false;
if(typeof params.recordingtitle !== 'undefined') {
    shouldRecord = true;
}

console.log(params);
console.log("Should record?: " + shouldRecord);

function setup() {
    if(!shouldRecord) {
        return;
    }

    if(socket === null) {
        // socket = io.connect('https://jelly.studio');
        socket = io.connect('localhost:4200');
        socket.on('message', function(data) {
            console.log('Message received: ' + data);
        });
    }
}

function handle(key, data) {
    if(!shouldRecord) {
        return;
    }

    data.push(new Date().getTime());
    socket.emit('saveMidi', { title: params.recordingtitle, data: data });
}

export const Recorder = {
    handleEvent: (key, data) => handle(key, data),
    setup: () => setup()
};