//replace with import when ready
var Finsemble = require("@chartiq/finsemble");
var $ = require("jquery");
$.xml2json = require("jquery-xml2json");
$.soap = require("jquery.soap");

//defaults
var yellowfinProtocol = "http://";
var yellowfinHost = "localhost";
var yellowfinPort = "8081";
var yellowfinPath = "/JsAPI";
var yellowfinReportPath = "/JsAPI?api=reports";
var yellowfinUser = "admin@yellowfin.com.au";
var yellowfinPass = "test";

//yellowfin demo data
// var yellowfinProtocol = "http://";
// var yellowfinHost = "35.178.45.11";
// var yellowfinPort = "80";
// var yellowfinPath = "/JsAPI";
// var yellowfinReportPath = "/JsAPI?api=reports";
// var yellowfinUser = "admin@yellowfin.com.au";
// var yellowfinPass = "test";


var RouterClient = Finsemble.Clients.RouterClient;
var baseService = Finsemble.baseService;
var Logger = Finsemble.Clients.Logger;
var util = Finsemble.Util;


//var LauncherClient = Finsemble.Clients.LauncherClient;
//LauncherClient.initialize();

/**
 * The yellowfin2 Service receives calls from the yellowfin2Client.
 * @constructor
 */
function yellowfin2Service() {

	var self = this;
	// /**
	//  * Creates router endpoints for all of our client APIs. Add servers or listeners for requests coming from your clients.
	//  * @private
	//  */
	// this.createRouterEndpoints = function () {

	// };

	this.getServerDetails = function () {
		return {
			"yellowfinProtocol": yellowfinProtocol,
			"yellowfinHost": yellowfinHost,
			"yellowfinPort": yellowfinPort,
			"yellowfinPath": yellowfinPath,
			"yellowfinReportPath": yellowfinReportPath
		};
	};
	
	this.getLoginToken = function (callback) {
		$.soap({
			url: yellowfinProtocol + yellowfinHost + ':' + yellowfinPort + '/webservices/LegacyAdministrationService',
			method: 'web:remoteAdministrationCall',
			appendMethodToURL: false,
			envAttributes: {'xmlns:web': 'http://webservices.web.mi.hof.com/'},
			data: {
				arg0: {
					function: 'LOGINUSER',
					loginId: yellowfinUser,
					orgId: 1,
					password: yellowfinPass,
					person: {
						userId: yellowfinUser,
						password: yellowfinPass
					}
				}
			},
			success: function (soapResponse) {
				var responseData = soapResponse.toJSON();
				try {
	
					if (responseData["#document"]["S:Envelope"]["S:Body"]["ns2:remoteAdministrationCallResponse"]["return"]["statusCode"] === "SUCCESS") {
						callback(null, responseData["#document"]["S:Envelope"]["S:Body"]["ns2:remoteAdministrationCallResponse"]["return"]["loginSessionId"]);
					} else {
						var msg = "YellowFin Webservice request (LOGINUSER) was not successful! Response: " + responseData["#document"]["S:Envelope"]["S:Body"]["ns2:remoteAdministrationCallResponse"]["return"]["statusCode"];
						Logger.error(msg);
						callback(msg, null);
					}
				} catch (err) {
					var msg = "Caught an error when using the YellowFin webservice (LOGINUSER): "
					Logger.error(msg, err);
					callback("YellowFin Webservice (LOGINUSER) response did not contain expected values, response: " + JSON.stringify(responseData, undefined, 2),null); 
				}
				// if you want to have the response as JSON use soapResponse.toJSON();
				// or soapResponse.toString() to get XML string
				// or soapResponse.toXML() to get XML DOM
			},
			error: function (soapResponse) {
				var msg = "YellowFin Webservice (LOGINUSER) returned an error! response: " + JSON.stringify(soapResponse.toJSON(), undefined, 2);
				Logger.error(msg);
				callback(msg,null); 
			}
		});
	};
	
	this.getAllUserReports = function (callback) {
		$.soap({
			url: yellowfinProtocol + yellowfinHost + ':' + yellowfinPort + '/webservices/LegacyAdministrationService',
			method: 'web:remoteAdministrationCall',
			appendMethodToURL: false,
			envAttributes: {'xmlns:web': 'http://webservices.web.mi.hof.com/'},
			data: {
				arg0: {
					function: 'GETALLUSERREPORTS',
					loginId: yellowfinUser,
					orgId: 1,
					password: yellowfinPass,
					person: {
						userId: yellowfinUser,
						password: yellowfinPass
					}
				}
			},
			success: function (soapResponse) {
				var responseData = soapResponse.toJSON();
				try {
	
					if (responseData["#document"]["S:Envelope"]["S:Body"]["ns2:remoteAdministrationCallResponse"]["return"]["statusCode"] === "SUCCESS") {
						callback(null, responseData["#document"]["S:Envelope"]["S:Body"]["ns2:remoteAdministrationCallResponse"]["return"]["reports"]);
					} else {
						var msg = "YellowFin Webservice request (GETALLUSERREPORTS) was not successful! Response: " + responseData["#document"]["S:Envelope"]["S:Body"]["ns2:remoteAdministrationCallResponse"]["return"]["statusCode"];
						Logger.error(msg);
						callback(msg, null);
					}
				} catch (err) {
					var msg = "Caught an error when using the YellowFin webservice (GETALLUSERREPORTS): "
					Logger.error(msg, err);
					callback("YellowFin Webservice (GETALLUSERREPORTS) response did not contain expected values, response: " + JSON.stringify(responseData, undefined, 2),null); 
				}
				// if you want to have the response as JSON use soapResponse.toJSON();
				// or soapResponse.toString() to get XML string
				// or soapResponse.toXML() to get XML DOM
			},
			error: function (soapResponse) {
				var msg = "YellowFin Webservice (GETALLUSERREPORTS) returned an error! response: " + JSON.stringify(soapResponse.toJSON(), undefined, 2);
				Logger.error(msg);
				callback(msg,null); 
			}
		});
	};

	return this;
}

yellowfin2Service.prototype = new baseService({
	startupDependencies: {
		services: ["dockingService", "authenticationService"]
	}
});
var serviceInstance = new yellowfin2Service('yellowfin2Service');
serviceInstance.onBaseServiceReady(function (callback) {
	Logger.start();

	//Set up SOAP client
	//npm install -PD jquery
	//npm install -PD jquery.soap
	//npm install -PD jquery-xml2json
	RouterClient.addPubSubResponder("yellowFinServer", serviceInstance.getServerDetails());

	RouterClient.addResponder("YF server", function(error, queryMessage) {
		if (!error) {
			Logger.log('YF server Query: ' + JSON.stringify(queryMessage));

			if (queryMessage.data.query === "server details") {
				queryMessage.sendQueryResponse(null, serviceInstance.getServerDetails());

			} else if (queryMessage.data.query === "login token") {
				serviceInstance.getLoginToken(function(err,token) {
					if (err) {
						queryMessage.sendQueryResponse(null, {loginToken: token});
					} else {
						queryMessage.sendQueryResponse(err, null);
					}
				});

			} else if  (queryMessage.data.query === "all reports") {
				serviceInstance.getAllUserReports(function(err,reports) {
					if (err) {
						queryMessage.sendQueryResponse(null, {"reports": reports});
					} else {
						queryMessage.sendQueryResponse(err, null);
					}
				});

			} else {
				queryMessage.sendQueryResponse("Unknown query function: " + queryMessage, null);
				Logger.error("Unknown query function: ", queryMessage);
			}
		} else {
			Logger.error("Failed to setup query responder", error);
		}
	});

	Logger.log("yellowFin2 Service ready");
	console.log("> yellowFin2 Service ready");
	callback();
});

serviceInstance.start();
window.yellowfin = serviceInstance;