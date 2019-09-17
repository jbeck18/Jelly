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

function handleEvent(key, data) {
    const eventType = data[0];
    
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
}

export const SoundGenerator = {
    handleEvent: (key, data) => handleEvent(key, data)
};