import { Visualizer } from './visualizer';
import { Broadcaster } from './broadcast';
import { SoundGenerator } from './sound-generator';
import { Recorder } from './recorder';

let midi = null;

class MidiHandler {

    constructor() {
        this.observers = [];
    }

    subscribe(observer) {
        this.observers.push(observer);
    }

    unsubscribe(observer) {
        this.observers = this.observers.filter(subscriber => subscriber !== observer);
    }

    notify(key, data) {
        this.observers.forEach(observer => observer(key, data));
    }
}

const midiHandler = new MidiHandler();
midiHandler.subscribe(Visualizer.handleEvent);
midiHandler.subscribe(Broadcaster.handleEvent);
midiHandler.subscribe(SoundGenerator.handleEvent);
midiHandler.subscribe(Recorder.handleEvent);

export function handleMIDIEvent(data) {
    const key = document.getElementById(data[1] + '');

    // console.log(data);

    midiHandler.notify(key, data);
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