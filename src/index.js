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
const socket = io.connect('localhost:4200');
socket.on('connect', function(data) {
    socket.emit('join', 'Hello World from client');
    console.log("connected!");
});

console.log('init done');

