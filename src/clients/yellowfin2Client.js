var Finsemble = require("@chartiq/finsemble");
var Logger = Finsemble.Clients.Logger;
Logger.system.log("Starting Yellowfin2Client");

var BaseClient =  Finsemble.Clients.BaseClient;

 /*
 * Your client
 * @constructor
 */
function Yellowfin2Client(params) {
	//Validate.args(params, "object=") && params && Validate.args2("params.onReady", params.onReady, "function=");
	var self = this;
	BaseClient.call(this, params);
	
	this.getServerDetails = function(cb) {
		self.routerClient.query("YF server", { query: "server details" }, function (err, response) {
			Logger.log("Yellowfin2Client.getServerDetails", params, cb);
			if (cb) {
				cb(err, response.data);
			}
		});
	};

	this.getLoginToken = function(cb) {
		self.routerClient.query("YF server", { query: "login token" }, function (err, response) {
			Logger.log("Yellowfin2Client.getLoginToken", params, cb);
			if (cb) {
				cb(err, response.data);
			}
		});
	};

	this.getAllUserReports = function(cb) {
		self.routerClient.query("YF server", { query: "all reports" }, function (err, response) {
			Logger.log("Yellowfin2Client.getAllUserReports", params, cb);
			if (cb) {
				cb(err, response.data);
			}
		});
	};

	return self;
}

var yellowfin2Client = new Yellowfin2Client({
	startupDependencies: {
		services: ["yellowfin2Service"]
	},
	onReady: function (cb) {
		console.log("Yellowfin2Client Ready");
		cb();
	},
	name: "Yellowfin2Client"
});

module.exports = yellowfin2Client;
