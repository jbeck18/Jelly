import io from 'socket.io-client';
import utils from './utils';
import { handleMIDIEvent } from './midi-consumer';
import { createPianoSound } from './sound-generator';

const params = utils.getParameters();
var socket = null;

var shouldPlayback = false;
if(typeof params.playbacktitle !== 'undefined') {
    shouldPlayback = true;
}

function startPlayback() {
    if(!shouldPlayback) {
        return;
    }

    if(socket === null) {
        createPianoSound();
        socket = io.connect('https://jelly.studio');
        // socket = io.connect('localhost:4200');
        socket.on('message', function(data) {
            console.log('Message received: ' + data);
        });

        socket.emit('requestRecording', params.playbacktitle);

        socket.on('recordingData', function(data) {
            const events = data['events'];
            events.forEach(function(event) {
                const delay = event.pop() + 1000;

                const e = [];
                e.push(event[0]);
                e.push(event[1]);
                e.push(event[2]);

                e[1] = parseInt(e[1], 10);

                setTimeout(function() {
                    handleMIDIEvent(e);
                }, delay);
            });
        });
    }
}

function setup() {
    document.getElementById('start-playback').onclick = function(e) {
        window.location.search = `?playbackTitle=${document.getElementById('playback-title').value}`;
    }
    setTimeout(startPlayback, 1000);
}

export const Playback = {
    setup: () => setup()
};
