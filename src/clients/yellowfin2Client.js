var Finsemble = require("@chartiq/finsemble");
var Util = Finsemble.Util; 
var FSBLconsole = new Util.Console("BaseClient"); // Finsemble console
var RouterClient = Finsemble.Clients.RouterClient;
 /*
 * Your client
 * @constructor
 */

var BaseClient = Finsemble.Clients.BaseClient;
var yellowfin2Client = function (params) {
	BaseClient.call(this, params);
	var self = this;

	return this;
};

var clientInstance = new yellowfin2Client({
	onReady: function (cb) {
		console.log("yellowfin2Client Ready");
		cb();
	},
	name:"yellowfin2Client"
});

clientInstance.requiredServices = ["dockingService", "authenticationService"];

module.exports = clientInstance;
