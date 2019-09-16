import { Visualizer } from './visualizer';
import utils from './utils';
import { Broadcaster } from './broadcast';
const SoundFont = require('soundfont-player');

let midi = null;

var ac = null;
var piano = null;

var notes = {};

function createPianoSound() {
    if(ac === null) {
        ac = new AudioContext();

        SoundFont.instrument(ac, 'acoustic_grand_piano').then(function(res) {
            piano = res;
        });
    }
}
document.getElementById('start-sound').onclick = createPianoSound;

const handleKeyPress = (key, data) => {
    const color = document.getElementById('pressed-color').value;
    if(color !== 'random') {
        key.style.fill = '#' + color;
    } else {
        key.style.fill = utils.randomColorHSL();
    }

    try {
        Visualizer.handleEvent(key, data);
    } catch(err) {
        console.log(err);
    }
};

const handleKeyDepress = (key, data) => {
    if(key.className.baseVal === 'white') {
        key.style.fill = 'white';
    } else {
        key.style.fill = 'black';
    }

    try {
        Visualizer.handleEvent(key, data);
    } catch(err) {
        console.log(err);
    }
};

export function handleMIDIEvent(data) {
    const eventType = data[0];
    const keyValue = data[1];
    const key = document.getElementById(keyValue + '');

    Broadcaster.handleEvent(key, data);
    console.log(data);
    switch(eventType) {
        // Key pressed
        case 144:
            handleKeyPress(key, data);
            break;

        // Key depressed
        case 128:
            handleKeyDepress(key, data);
            break;
    }

    if(piano !== null) {
        if(eventType === 144) {
            let key = data[1];
            let volume = (data[2] / 127)
            volume = parseFloat(Math.round(volume * 100) / 100);

            let val = piano.play(key, ac.currentTime, { gain: volume });
            notes[key] = val;
        } else if(eventType === 128) {
            let key = data[1];
            notes[key].stop(ac.currentTime + 0.01);
            notes[key] = null;
        }
    }
};

function handleIncomingMIDI(data) {
    if(!Array.isArray(data)) {
        data = data.data;
    }

    handleMIDIEvent(data);
}

function onMIDISuccess(midiAccess) {
    midi = midiAccess;

    midiAccess.inputs.forEach( function(entry) {
        entry.onmidimessage = handleIncomingMIDI;
    });

    console.log( "Obtained permission for MIDI access!" );
};

const onMIDIFailure = (msg) => {
    console.log( "Failed to get MIDI access - " + msg );
};

export function requestMIDIAccess() {
    console.log("requesting midi access...");
    navigator.requestMIDIAccess( { sysex: true } ).then( onMIDISuccess, onMIDIFailure );
}