const Tone = require('tone');
import application from './application';
import { requestMIDIAccess } from './midi-consumer';
import { Visualizer } from './visualizer';
import { Broadcaster } from './broadcast';

var synth = new Tone.PolySynth(4, Tone.Synth).toMaster();
Tone.context.lookAhead = 0;


function startup() {
    requestMIDIAccess();
    Visualizer.start();
}

application.setupKeys();
application.animatePageLoad(startup);
Broadcaster.setup();

const io = require('socket.io-client');
const socket = io.connect('https://jelly.studio');
socket.on('connection', function(data) {
    socket.emit('join', '123456');
    console.log("connected to room 123456");
});

socket.on('message', function(msg) {
    console.log('message received: ' + msg);
});

console.log('init done');

