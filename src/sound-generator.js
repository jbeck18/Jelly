const SoundFont = require('soundfont-player');

var ac = null;
var piano = null;
var notes = {};
var sustaining = false;

export function createPianoSound() {
    if(ac === null) {
        ac = new AudioContext();

        SoundFont.instrument(ac, 'acoustic_grand_piano').then(function(res) {
            piano = res;
        });
    }
}
document.getElementById('start-sound').onclick = createPianoSound;

var deactivateQueue = [];

class SoundRegistry {
    constructor() {
        this.notes = {};
    }

    registerPress(key, data) {
        let volume = (data[2] / 127);
        volume = parseFloat(Math.round(volume * 100) / 100);

        const node = {
            players: [],
            interval: null,
            volume: volume,
            key: data[1],
            start() {
                this.players.push(piano.play(this.key, ac.currentTime, { gain: this.volume } ));

                this.interval = setInterval(function() {
                    let ops = {};
                    node.volume = Math.max(node.volume-0.1, 0);
                    
                    ops.gain = node.volume;
                    ops.attack = 2;

                    node.players.push(piano.play(node.key, ac.currentTime, ops));
                }, 1500);            
            },
            stop() {
                clearInterval(this.interval);
                this.players.forEach(function(player) {
                    player.stop(ac.currentTime + 0.01);
                });
            }
        };
        node.start();
        this.notes[data[1]] = node;
    }

    registerDepress(key, data) {
        if(!sustaining) {
            this.notes[data[1]].stop();
        } else {
            deactivateQueue.push(this.notes[data[1]]);
        }
        delete this.notes[data[1]];
    }
}

const registry = new SoundRegistry();

function handleEvent(key, data) {
    const eventType = data[0];

    if(piano !== null) {
        const key = data[1];
        if(eventType === 144) {
            registry.registerPress(key, data);
        } else if(eventType === 128) {
            registry.registerDepress(key, data);            
        } else if(data[1] === 64 || data[0] === 176) {
            if(data[2] >= 64) {
                sustaining = true;
            } else {
                if(!sustaining) return;
                sustaining = false;
                console.log("stoppping sustained notes");

                deactivateQueue.forEach(function(note) {
                    note.stop();
                });
                deactivateQueue = [];
            }
        }
    }
}

export const SoundGenerator = {
    handleEvent: (key, data) => handleEvent(key, data)
};