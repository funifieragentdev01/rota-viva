angular.module('rotaViva').factory('SoundService', function() {
    var enabled = localStorage.getItem('rv_sound') !== 'off';
    var sounds = {};

    function preload(name, src) {
        try {
            var audio = new Audio(src);
            audio.preload = 'auto';
            sounds[name] = audio;
        } catch(e) {}
    }

    preload('correct', 'audio/beep.mp3');
    preload('wrong',   'audio/wrong.mp3');
    preload('levelup', 'audio/magic-sound.mp3');

    return {
        play: function(name) {
            if (!enabled || !sounds[name]) return;
            try {
                sounds[name].currentTime = 0;
                sounds[name].play().catch(function() {});
            } catch(e) {}
        },
        isEnabled: function() { return enabled; },
        setEnabled: function(val) {
            enabled = !!val;
            localStorage.setItem('rv_sound', enabled ? 'on' : 'off');
        }
    };
});
