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

document.getElementById('start-recording').onclick = function(e) {
    window.location.search = `?recordingTitle=${document.getElementById('recording-title').value}`;
}

function setup() {
    if(!shouldRecord) {
        return;
    }

    if(socket === null) {
        socket = io.connect('https://jelly.studio');
        // socket = io.connect('localhost:4200');
        socket.on('message', function(data) {
            console.log('Message received: ' + data);
        });
    }
}

var started = false;
var startTime = null;

function handle(key, data) {
    if(!shouldRecord) {
        return;
    }

    if(!started) {
        started = true;
        startTime = new Date().getTime();
    }

    const d = [];
    d.push(data[0]);
    d.push(data[1]);
    d.push(data[2]);
    d[1] = d[1] + '';
    d.push(new Date().getTime() - startTime);

    console.log(d);

    socket.emit('saveMidi', { title: params.recordingtitle, data: d });
}

export const Recorder = {
    handleEvent: (key, data) => handle(key, data),
    setup: () => setup()
};
