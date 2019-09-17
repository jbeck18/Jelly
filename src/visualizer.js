import { midiToNoteName } from '@tonaljs/midi';
import utils from './utils';

const noteName = document.getElementById('note-name');
const visualizer = document.getElementById('visualizer');
const keysPressed = [];

// Need to be recalculated when window is resized?
const defaultWidthBlackKey = document.getElementById('22').getBoundingClientRect().width;
const defaultWidthWhiteKey = document.getElementById('21').getBoundingClientRect().width;

const visualizerHeight = visualizer.getBoundingClientRect().height + 'px';

/**
 * Creates a box element for the visualizer
 * @param {*} key 
 * @param {*} data 
 */
function createBox(key, data) {
    const box = document.createElement('div');
    box.style.display = 'inline-block'
    box.style.position = 'absolute';

    box.style.height = 'auto';
    box.style.top = visualizerHeight;
    box.style.bottom = 0;

    box.style.backgroundColor = `hsl(314,${Math.floor((data[2] * 100) / 127)}%,49%)`;

    box.classList.add('currentlyPressed');
    box.classList.add(midiToNoteName(key.id));

    return box;
}

/**
 * Handles a key press event
 * @param {*} key 
 * @param {*} data 
 */
function handleKeyPress(key, data) {
    key.style.fill = utils.getNextColor();

    const box = createBox(key, data);
    
    if(key.className.baseVal === 'white') {
        const defaultWidth = defaultWidthWhiteKey;
        const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const note = midiToNoteName(key.id);
        function computeLeft() {
            if(note === 'A0') {
                return 0;
            } else if(note === 'B0') {
                return defaultWidth * 1.25;
            }

            const n = note[0];
            const oct = note[1];
            
            let result = ((notes.indexOf(n)*defaultWidth) + ((oct-1)*7*defaultWidth) + (2*defaultWidth));

            if(['A', 'B', 'D', 'E', 'G'].includes(n)) {
                result += (defaultWidth/4);
            }

            return result;
        }

        const left = computeLeft();
        box.style.left = left + 'px';

        let width = defaultWidth;
        if(note === 'C8') {
            
        } else if(note === 'A0') {
            width -= (defaultWidth/4);
        } else if(['B', 'C', 'E', 'F'].includes(note[0])) {
            width -= (defaultWidth/4);
        } else {
            width -= (defaultWidth/2);
        }
        box.style.width = width + 'px';
    } else {
        const defaultWidth = defaultWidthBlackKey;
        let note = midiToNoteName(key.id);

        function computeLeft() {
            if(note === 'Bb0') {
                return defaultWidth * 1.5;
            } else if(note === 'Db1') {
                return defaultWidth * 5.5;
            } else if(note === 'Eb1') {
                return defaultWidth * 7.5;
            } else if(note === 'Gb1') {
                return defaultWidth * 11.5;
            } else if(note === 'Ab1') {
                return defaultWidth * 13.5;
            } else {
                let octave = note[2];
                if(note[0] === 'B') {
                    octave++;
                }
                if(['D', 'E', 'G', 'A'].includes(note[0])) {
                    note = note[0] + note[1] + '1';
                } else {
                    note = note[0] + note[1] + '0';
                }
                return computeLeft() + ((parseInt(octave-1, 10) * 14 * defaultWidth));
            }
        }

        const left = computeLeft();
        box.style.left = left + 'px';
        box.style.width = defaultWidth + 'px';
    }

    visualizer.appendChild(box);
    keysPressed.push(midiToNoteName(key.id));
}

/**
 * Handles a key depress event
 * @param {*} key 
 * @param {*} data 
 */
function handleKeyDepress(key, data) {
    key.style.fill = key.classList.contains('white') ? 'white' : 'black';

    const pressed = visualizer.querySelectorAll(`.currentlyPressed, .${midiToNoteName(key.id)}`);

    for(var i = 0; i < pressed.length; i++) {
        if(pressed[i].className.split(' ').includes('currentlyPressed') && pressed[i].className.split(' ').includes(midiToNoteName(key.id))) {
            pressed[i].classList.remove('currentlyPressed');
        }
    }

    for(var i = 0; i < keysPressed.length; i++) {
        if(keysPressed[i] === midiToNoteName(key.id)) {
            keysPressed.splice(i, 1);
            break;
        }
    }
}

const handle = function(key, data) {
    if(data[0] === 144) {
        handleKeyPress(key, data);
    } else if(data[0] === 128) {
        handleKeyDepress(key, data);
    }

    noteName.innerHTML = keysPressed.join(', ') || '-';
};

let interval = null;

/**
 * Start the visualizer
 */
const start = function() {

    if(interval !== null) {
        return;
    }

    interval = setInterval(function() {
        for(let i = 0; i < visualizer.children.length; i++) {

            const element = visualizer.children[i];

            let top = parseInt(element.style.top);
            let bottom = parseInt(element.style.bottom);

            if(top > 0) {
                top--;
            }


            if(element.classList.contains("currentlyPressed")) {
                
            } else {
                bottom++;
            }

            element.style.top = top + 'px';
            element.style.bottom = bottom + 'px';

            if(parseInt(element.style.bottom, 10) >= visualizer.getBoundingClientRect().height) {
                element.remove();
            }
        }
    }, 10);
}

/**
 * Stop the visualizer
 */
const stop = function() {
    clearInterval(interval);
    interval = null;
}

export const Visualizer = {
    handleEvent: (key, data) => handle(key, data),
    start: () => start(),
    stop: () => stop()
};