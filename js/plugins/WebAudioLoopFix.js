/*:
 * @plugindesc Fixes BGM turning to static after the first loop in web browsers (GitHub Pages).
 * @author Local
 *
 * @help
 * RPG Maker MV reads LOOPSTART/LOOPLENGTH from the audio file, then sets
 * Web Audio loopEnd from those tags. Chrome and Safari distort the sound
 * after one loop if loopEnd is even slightly past the decoded buffer.
 *
 * Test play (NW.js) is more forgiving, so the same track can loop forever
 * in the editor and break on GitHub Pages.
 *
 * This plugin:
 * - Clamps loop points inside the decoded buffer
 * - Uses .ogg on any browser that can play it (including Android).
 *   iPhone still uses .m4a because Safari cannot play OGG.
 *
 * Keep this plugin ON. If Plugin Manager drops it after a save, the same
 * clamp also lives in js/rpg_core.js and js/rpg_managers.js.
 */

(function() {

    function clampLoopPoints(audio) {
        if (audio._buffer && audio._buffer.duration > 0) {
            audio._totalTime = audio._buffer.duration;
        }
        var duration = audio._totalTime;
        if (!(duration > 0)) {
            audio._loopStart = 0;
            audio._loopLength = 0;
            return;
        }
        var sampleRate = (audio._buffer && audio._buffer.sampleRate) || audio._sampleRate || 44100;
        var epsilon = 1 / sampleRate;
        if (!isFinite(audio._loopStart) || audio._loopStart < 0) {
            audio._loopStart = 0;
        }
        if (!isFinite(audio._loopLength) || audio._loopLength <= 0 || audio._loopStart >= duration) {
            audio._loopStart = 0;
            audio._loopLength = Math.max(epsilon, duration - epsilon);
            return;
        }
        var maxLength = duration - audio._loopStart - epsilon;
        if (audio._loopLength > maxLength) {
            audio._loopLength = Math.max(epsilon, maxLength);
        }
    }

    if (WebAudio.prototype._clampLoopPoints) {
        var _engineClamp = WebAudio.prototype._clampLoopPoints;
        WebAudio.prototype._clampLoopPoints = function() {
            _engineClamp.call(this);
            clampLoopPoints(this);
        };
    } else {
        WebAudio.prototype._clampLoopPoints = function() {
            clampLoopPoints(this);
        };
    }

    AudioManager.audioFileExt = function() {
        if (WebAudio.canPlayOgg()) {
            return '.ogg';
        }
        return '.m4a';
    };

})();
