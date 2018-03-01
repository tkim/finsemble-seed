//replace with import when ready
var Finsemble = require("@chartiq/finsemble");

var RouterClient = Finsemble.Clients.RouterClient;
var baseService = Finsemble.baseService;
var Logger = Finsemble.Clients.Logger;
var util = Finsemble.Util;
var StorageClient = Finsemble.Clients.StorageClient;
StorageClient.initialize();
//var LauncherClient = Finsemble.Clients.LauncherClient;
//LauncherClient.initialize();

/**
 * The yellowfin2 Service receives calls from the yellowfin2Client.
 * @constructor
 */
function yellowfin2Service() {

	var self = this;
	/**
	 * Creates router endpoints for all of our client APIs. Add servers or listeners for requests coming from your clients.
	 * @private
	 */
	this.createRouterEndpoints = function () {

	};

	return this;
}
yellowfin2Service.prototype = new baseService({
	startupDependencies: {
		services: ["dockingService", "authenticationService"],
		clients: ["storageClient"]
	}
});
var serviceInstance = new yellowfin2Service('yellowfin2Service');

serviceInstance.onBaseServiceReady(function (callback) {
	Logger.start();
	Logger.log("yellowFin2 Service ready");
	callback();
});

serviceInstance.start();
module.exports = serviceInstance;