const Tone = require('tone');
import application from './application';
import { requestMIDIAccess } from './midi-consumer';
import { Visualizer } from './visualizer';

var synth = new Tone.PolySynth(4, Tone.Synth).toMaster();
Tone.context.lookAhead = 0;


function startup() {
    requestMIDIAccess();
    Visualizer.start();
}

application.setupKeys();
application.animatePageLoad(startup);

console.log('init done');

