import anime from 'animejs/lib/anime.es';
import { handleMIDIEvent } from './midi-consumer';

const application = {

    setupKeys: () => {
        const keys = [];
        for(var i = 21; i <= 108; i++) {
            const key = document.getElementById(i + '')
            key.onmousedown = () => {
                handleMIDIEvent([144, key.id, 127]);
            };
        
            key.onmouseup = () => {
                handleMIDIEvent([128, key.id, 0]);
            };
        
            keys.push(key);
            key.style.opacity = 0;
            key.style.cursor = 'pointer';
        }

        return keys;
    },

    animatePageLoad(callback = null) {
        // Animate logo outline
        anime({
            targets: '#logo svg path',
            strokeDashoffset: [anime.setDashoffset, 0],
            easing: 'easeInOutSine',
            duration: 1000,
            delay: 0 //anime.stagger(750, {start: 100})
        });
        // Animate logo fill
        anime({
            targets: '#logo svg path',
            "fill-opacity": 1,
            easing: 'easeInOutSine',
            duration: 1000,
            delay: 0 //anime.stagger(20, {start: 4100})
        });
        // Animate keys
        const keys = Array.from(document.querySelectorAll('.white, .black')).sort(function(a, b) {
            return parseInt(a.id, 10) - parseInt(b.id, 10);
        });
        anime({
            targets: keys,
            opacity: 1,
            delay: 0, //anime.stagger(20, {start: 5000}),
            easing: 'easeInOutSine',
            complete: callback
        });
    }
};

export default application;