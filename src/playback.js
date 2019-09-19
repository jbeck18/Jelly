import io from 'socket.io-client';
import utils from './utils';
import { handleMIDIEvent } from './midi-consumer';

const params = utils.getParameters();
var socket = null;

var shouldPlayback = false;
if(typeof params.playbacktitle !== 'undefined') {
    shouldPlayback = true;
}

function setup() {
    if(!shouldPlayback) {
        return;
    }

    if(socket === null) {
        // socket = io.connect('https://jelly.studio');
        socket = io.connect('localhost:4200');
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

export const Playback = {
    setup: () => setup()
};