//replace with import when ready
var Finsemble = require("@chartiq/finsemble");

var RouterClient = Finsemble.Clients.RouterClient;
var baseService = Finsemble.baseService;
var Logger = Finsemble.Clients.Logger;
var util = Finsemble.Util;
/**
 * The yellowfin Service receives calls from the yellowfinClient.
 * @constructor
 */
function yellowfinService() {

	var self = this;
	/**
	 * Creates router endpoints for all of our client APIs. Add servers or listeners for requests coming from your clients.
	 * @private
	 */
	this.createRouterEndpoints = function () {

	};

	return this;
}
yellowfinService.prototype = new baseService({
	startupDependencies: {
		services: ["dockingService", "authenticationService"],
		clients: ["launcherClient", "storageClient"]
	}
});
// yellowfinService.prototype = new baseService();

var serviceInstance = new yellowfinService('yellowfinService');

fin.desktop.main(function () {
	// serviceInstance.setOnConnectionComplete(function (callback) {
	// 	console.debug("onConnectionCompleteCalled");
	// 	serviceInstance.createRouterEndpoints();
	// 	callback();
	// });
})

serviceInstance.onBaseServiceReady(function (callback) {
	Logger.start();
	callback();
});
serviceInstance.start();
Logger.log("yellowFin Service start() called");
module.exports = serviceInstance;