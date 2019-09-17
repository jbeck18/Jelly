import application from './application';
import { requestMIDIAccess } from './midi-consumer';
import { Visualizer } from './visualizer';
import { Broadcaster } from './broadcast';


function startup() {
    requestMIDIAccess();
    Visualizer.start();
}

application.setupKeys();
application.animatePageLoad(startup);
Broadcaster.setup();

console.log('init done');

