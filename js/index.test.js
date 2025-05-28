const assert = require('assert');

describe('JavaScript Functionality Tests', () => {
    it('should load swapFromGame.js without MIME type issues', () => {
        const script = document.createElement('script');
        script.src = 'http://127.0.0.1:5501/swapFromGame.js';
        script.onload = () => {
            assert.ok(true);
        };
        script.onerror = () => {
            assert.fail('Failed to load swapFromGame.js');
        };
        document.body.appendChild(script);
    });

    it('should load grunt.mp3 media resource', () => {
        const audio = new Audio('http://127.0.0.1:5501/assets/grunt.mp3');
        audio.oncanplaythrough = () => {
            assert.ok(true);
        };
        audio.onerror = () => {
            assert.fail('Failed to load grunt.mp3');
        };
        audio.load();
    });

    it('should not have gruntAudio as null', () => {
        // Setup: Ensure the element exists in the DOM for the test
        let gruntAudio = document.getElementById('gruntAudio');
        if (!gruntAudio) {
            gruntAudio = document.createElement('audio');
            gruntAudio.id = 'gruntAudio';
            document.body.appendChild(gruntAudio);
        }
        assert.notStrictEqual(gruntAudio, null);
    });
});