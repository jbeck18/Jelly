const SoundFont = require('soundfont-player');

var ac = null;
var piano = null;
var notes = {};
var sustaining = false;

function createPianoSound() {
    if(ac === null) {
        ac = new AudioContext();

        SoundFont.instrument(ac, 'acoustic_grand_piano').then(function(res) {
            piano = res;
        });
    }
}
document.getElementById('start-sound').onclick = createPianoSound;

function playNote(key, data) {
    let volume = (data[2] / 127);
    volume = parseFloat(Math.round(volume * 100) / 100);

    let playerId = piano.play(key, ac.currentTime, { volume: volume } );

    if(notes[data[1]] === null || typeof notes[data[1]] === 'undefined') {
        notes[data[1]] = {
            intervals: [],
            players: [playerId]
        };
    }

    const id = setInterval(function() {
        let ops = {};
        volume = Math.max(volume-0.1, 0);
        
        ops.volume = volume;
        ops.attack = 2;

        let playerId = piano.play(key, ac.currentTime, ops);

        notes[data[1]].players.push(playerId);

    }, 1500);

    notes[data[1]].intervals.push(id);
}

var deactivateQueue = [];

function handleEvent(key, data) {
    const eventType = data[0];

    if(piano !== null) {
        const key = data[1];
        if(eventType === 144) {
            playNote(key, data);
        } else if(eventType === 128) {
            const intervals = notes[key].intervals;
            const players = notes[key].players;

            const stopNote = function() {
                intervals.forEach(function(interval) {
                    clearInterval(interval);
                });

                players.forEach(function(note) {
                    note.stop(ac.currentTime + 0.01);
                });
                notes[key] = null;
            }

            if(!sustaining) {
                stopNote();
            } else {
                console.log("sustaining depressed note!")
                deactivateQueue.push(stopNote);
            }
        } else if(data[1] === 64) {
            if(data[2] >= 64) {
                sustaining = true;
            } else {
                if(!sustaining) return;
                sustaining = false;
                console.log("stoppping sustained notes")
                deactivateQueue.forEach(function(stop) {
                    stop();
                });
                deactivateQueue = [];
            }
        }
    }
}

export const SoundGenerator = {
    handleEvent: (key, data) => handleEvent(key, data)
};