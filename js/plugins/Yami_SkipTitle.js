/*:
 * @plugindesc Skip the title scene for testing purpose.
 * @author Yami
 * @version 1.1
 *
 * @help
 * Skips the title screen and starts a new game.
 *
 * Compatible with MOG - Title Splash Screen: splash logos still play,
 * then the game starts instead of showing the title menu.
 *
 * Returning to the title later (game over, game end) is not skipped.
 */

(function() {

    var _SceneManager_goto = SceneManager.goto;
    SceneManager.goto = function(sceneClass) {
        if (sceneClass === Scene_Title && shouldSkipTitle()) {
            DataManager.setupNewGame();
            sceneClass = Scene_Map;
        }
        _SceneManager_goto.call(this, sceneClass);
    };

    function shouldSkipTitle() {
        var scene = SceneManager._scene;
        if (!scene) {
            return true;
        }
        if (scene instanceof Scene_Boot) {
            return true;
        }
        // MOG - Title Splash Screen
        if (typeof Scene_Splash_Screen !== 'undefined' &&
                scene instanceof Scene_Splash_Screen) {
            return true;
        }
        // MadeWithMv splash
        if (typeof Scene_Splash !== 'undefined' &&
                scene instanceof Scene_Splash) {
            return true;
        }
        return false;
    }

})();
