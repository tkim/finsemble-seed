var Finsemble = require("@chartiq/finsemble");
var Util = Finsemble.Util; 
var FSBLconsole = new Util.Console("BaseClient"); // Finsemble console
var RouterClient = Finsemble.Clients.RouterClient;
 /*
 * Your client
 * @constructor
 */

var BaseClient = Finsemble.Clients.BaseClient;
function Yellowfin2Client(params) {
	BaseClient.call(this, params);
	var self = this;

	var getServerDetails = function() {
		return self.getServerDetails();
	}



	return self;
}

var yellowfin2Client = new Yellowfin2Client({
	onReady: function (cb) {
		console.log("Yellowfin2Client Ready");
		cb();
	},
	name: "Yellowfin2Client"
});

yellowfin2Client.requiredServices = ["dockingService", "authenticationService"];

module.exports = yellowfin2Client;
