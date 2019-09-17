const SoundFont = require('soundfont-player');

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

function playNote(key, data) {
    let volume = (data[2] / 127);
    volume = parseFloat(Math.round(volume * 100) / 100);

    let playerId = piano.play(key, ac.currentTime, { volume: volume } );

    const id = setInterval(function() {
        let ops = {};
        volume = Math.max(volume-0.1, 0);
        
        ops.volume = volume;
        ops.attack = 2;

        // console.log("playing with volume of: " + volume);

        let playerId = piano.play(key, ac.currentTime, ops);
        notes[data[1]].players.push(playerId);

    }, 1500);

    notes[data[1]] = {
        interval: id,
        players: [playerId]
    };
}

function handleEvent(key, data) {
    const eventType = data[0];

    if(piano !== null) {
        const key = data[1];
        if(eventType === 144) {
            playNote(key, data);

        } else if(eventType === 128) {
            // notes[key].stop(ac.currentTime + 0.01);
            clearInterval(notes[key].interval);
            notes[key].players.forEach(function(note) {
                note.stop(ac.currentTime + 0.01);
            });
            notes[key] = null;
        }
    }
}

export const SoundGenerator = {
    handleEvent: (key, data) => handleEvent(key, data)
};