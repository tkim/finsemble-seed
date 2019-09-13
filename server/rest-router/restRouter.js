"use strict";
exports.__esModule = true;
var util_1 = require("util");
var routerClientInstance_1 = require("./routerClient/routerClientInstance");
var launcherClient_1 = require("./clientBridge/launcherClient");
var launcherClient = new launcherClient_1["default"](routerClientInstance_1["default"]);
var subscribe = util_1.promisify(routerClientInstance_1["default"].subscribe);
exports.subscribe = subscribe;
var restFinsembleActions = {
    spawn: function (component, params, callback) {
        launcherClient.Spawn(component, params, callback);
    },
    publish: function (topic, data) {
        routerClientInstance_1["default"].publish(topic, data);
    },
    transmit: function (topic, data) {
        routerClientInstance_1["default"].transmit(topic, JSON.stringify(data), {});
    },
    query: function (topic, data, callback) {
        routerClientInstance_1["default"].query(topic, data, callback);
    }
};
exports.restFinsembleActions = restFinsembleActions;
