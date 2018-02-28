var Finsemble = require("@chartiq/finsemble");
var Utils =Finsemble.Utils; 
var Validate = Finsemble.Validate; // Finsemble args validator
var validate = new Validate(); 
var FSBLconsole = new Utils.Console("BaseClient"); // Finsemble console

var RouterClient = Finsemble.RouterClient;
var baseService = Finsemble.baseService;
 /*
 * Your client
 * @constructor
 */

var BaseClient = Finsemble.BaseClient;
var yellowfin2Client = function (params) {
	validate.args(params, "object=") && params && validate.args2("params.onReady", params.onReady, "function=");
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
