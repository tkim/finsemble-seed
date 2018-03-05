//replace with import when ready
var Finsemble = require("@chartiq/finsemble");
var $ = require("jquery");
$.xml2json = require("jquery-xml2json");
$.soap = require("jquery.soap");

var yellowfinProtocol = "http://";
var yellowfinHost = "localhost";
var yellowfinPort = "8081";
var yellowfinUser = "admin@yellowfin.com.au";
var yellowfinPass = "test";


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

	//Set up SOAP client
	//npm install -PD jquery
	//npm install -PD jquery.soap

	//curl "http://localhost:8081/webservices/LegacyAdministrationService/remoteAdministrationCall" -X OPTIONS -H "Access-Control-Request-Method: POST" -H "Origin: http://localhost:3375" -H "Accept-Encoding: gzip, deflate" -H "Accept-Language: en-US" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 OpenFin/8.56.26.50 Safari/537.36" -H "Accept: */*" -H "Referer: http://localhost:3375/services/yellowfin2/yellowfin2.html" -H "Connection: keep-alive" -H "Access-Control-Request-Headers: content-type, soapaction" --compressed
	$.soap({
		url: yellowfinProtocol + yellowfinHost + ':' + yellowfinPort + '/webservices/LegacyAdministrationService/',
		method: 'remoteAdministrationCall',
	
		// HTTPHeaders: {
		// 	"Access-Control-Request-Method:": ""
		// },
		data: {
			loginId: yellowfinUser,
			password: yellowfinPass,
			orgId: 1,
			function: 'LOGINUSER',
			person: {
				userId: yellowfinUser,
				password: yellowfinPass
			}
		},
		
		success: function (soapResponse) {
			// do stuff with soapResponse
			console.log("> Success " + JSON.stringify(soapResponse));
			
			// if you want to have the response as JSON use soapResponse.toJSON();
			// or soapResponse.toString() to get XML string
			// or soapResponse.toXML() to get XML DOM
		},
		error: function (soapResponse) {
			// show error
			console.log("> Error " + JSON.stringify(soapResponse));
		}
	});


	Logger.log("yellowFin2 Service ready");
	console.log("> yellowFin2 Service ready");
	callback();
});

serviceInstance.start();
module.exports = serviceInstance;