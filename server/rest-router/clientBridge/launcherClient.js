"use strict";
exports.__esModule = true;
var LauncherClient = /** @class */ (function () {
    function LauncherClient(routerClient) {
        if (routerClient["default"]) {
            this.spawnClient = routerClient["default"];
        }
        else {
            this.spawnClient = routerClient;
        }
    }
    LauncherClient.prototype.Spawn = function (component, parameters, callback) {
        if (parameters === void 0) { parameters = {}; }
        parameters["component"] = component;
        this.spawnClient.query("Launcher.spawn", parameters, {}, callback);
    };
    return LauncherClient;
}());
exports["default"] = LauncherClient;
