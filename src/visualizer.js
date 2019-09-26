import { midiToNoteName } from '@tonaljs/midi';
import utils from './utils';

const noteName = document.getElementById('note-name');
const visualizer = document.getElementById('visualizer');

const dpi = window.devicePixelRatio;
const animationStep = dpi*3;

var defaultWidthBlackKey;
var defaultWidthWhiteKey;

var visualizerHeight;

function calculateSizes() {
    visualizer.width = document.getElementById('visualizer-div').getBoundingClientRect().width * dpi;
    visualizer.height = document.getElementById('visualizer-div').getBoundingClientRect().height * dpi;

    defaultWidthBlackKey = document.getElementById('22').getBoundingClientRect().width * dpi;
    defaultWidthWhiteKey = document.getElementById('21').getBoundingClientRect().width * dpi;

    visualizerHeight = visualizer.getBoundingClientRect().height * dpi;

    console.log('dpi: ' + dpi);
    console.log('width: ' + visualizer.width);
    console.log('height: ' + visualizer.height);
};
calculateSizes();
window.addEventListener('resize', calculateSizes);

var keysPressed = [];
var visualizerNodes = [];

/**
 * Creates a box element for the visualizer
 * @param {*} key 
 * @param {*} data 
 */
function createBox(key, data) {
    const box = {
        x: 0,
        y: visualizerHeight,
        width: 0,
        height: animationStep,
        fill: `hsl(314,${Math.floor((data[2] * 100) / 127)}%,49%)`,
        note: midiToNoteName(key.id),
        currentlyPressed: true
    };

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
        box.x = left;

        let width = defaultWidth;
        if(note === 'C8') {
            
        } else if(note === 'A0') {
            width -= (defaultWidth/4);
        } else if(['B', 'C', 'E', 'F'].includes(note[0])) {
            width -= (defaultWidth/4);
        } else {
            width -= (defaultWidth/2);
        }
        box.width = width;
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
        box.x = left;
        box.width = defaultWidth;
    }

    visualizerNodes.push(box);
    keysPressed.push(midiToNoteName(key.id));
}

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object 
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === 'undefined') {
      stroke = true;
    }
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
}

/**
 * Handles a key depress event
 * @param {*} key 
 * @param {*} data 
 */
function handleKeyDepress(key, data) {
    key.style.fill = key.classList.contains('white') ? 'white' : 'black';

    for(var i = 0; i < visualizerNodes.length; i++) {
        if(visualizerNodes[i].currentlyPressed && visualizerNodes[i].note === midiToNoteName(key.id)) {
            visualizerNodes[i].currentlyPressed = false;
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

/**
 * Start the visualizer
 */
const start = function() {
    const begin = function() {
        for(let i = 0; i < visualizerNodes.length; i++) {

            const element = visualizerNodes[i];

            if(element.currentlyPressed && element.height < visualizerHeight) {
                element.height+=animationStep;
                element.y-=animationStep;
            } else if(!element.currentlyPressed) {
                if(element.y > 0) {
                    element.y-=animationStep;
                } else {
                    element.height-=animationStep;
                }
            }
        }

        visualizerNodes = visualizerNodes.filter(function(node) {
            return (node.y + node.height) > 0;
        });

        const ctx = visualizer.getContext('2d');
        ctx.clearRect(0, 0, visualizer.width, visualizer.height);
        for(let i = 0; i < visualizerNodes.length; i++) {
            const element = visualizerNodes[i];
            ctx.fillStyle = element.fill;
            roundRect(ctx, element.x, element.y, element.width, element.height, 10, true, false);
        }

        window.requestAnimationFrame(begin);
    }

    begin();
}

export const Visualizer = {
    handleEvent: (key, data) => handle(key, data),
    start: () => start()
};