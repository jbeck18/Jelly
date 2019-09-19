import application from './application';
import { requestMIDIAccess } from './midi-consumer';
import { Visualizer } from './visualizer';
import { Broadcaster } from './broadcast';
import { Recorder } from './recorder';
import { Playback } from './playback';

function startup() {
    try {
        requestMIDIAccess();
    } catch(err) {
        console.log(err);
    }
    Visualizer.start();
}

application.setupKeys();
application.animatePageLoad(startup);
Broadcaster.setup();
Recorder.setup();
Playback.setup();

console.log('init done');

