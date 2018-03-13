const Finsemble = require("@chartiq/finsemble");
const $ = require("jquery");
$.xml2json = require("jquery-xml2json");
$.soap = require("jquery.soap");

//defaults
let yellowfinProtocol = "http://";
let yellowfinHost = "localhost";
let yellowfinPort = "8081";
let yellowfinPath = "/JsAPI";
let yellowfinReportPath = "/JsAPI?api=reports";
let yellowfinUser = "admin@yellowfin.com.au";
let yellowfinPass = "test";

//yellowfin demo data
// let yellowfinProtocol = "http://";
// let yellowfinHost = "35.178.45.11";
// let yellowfinPort = "80";
// let yellowfinPath = "/JsAPI";
// let yellowfinReportPath = "/JsAPI?api=reports";
// let yellowfinUser = "admin@yellowfin.com.au";
// let yellowfinPass = "test";


const RouterClient = Finsemble.Clients.RouterClient;
const baseService = Finsemble.baseService;
const Logger = Finsemble.Clients.Logger;

//let LauncherClient = Finsemble.Clients.LauncherClient;
//LauncherClient.initialize();

/**
 * The yellowfin2 Service receives calls from the yellowfin2Client.
 * @constructor
 */
function yellowfin2Service() {

	let self = this;
	// /**
	//  * Creates router endpoints for all of our client APIs. Add servers or listeners for requests coming from your clients.
	//  * @private
	//  */
	// this.createRouterEndpoints = function () {

	// };

	this.getServerDetails = function () {
		Logger.log("Received getServerDetails call");
		
		return {
			"yellowfinProtocol": yellowfinProtocol,
			"yellowfinHost": yellowfinHost,
			"yellowfinPort": yellowfinPort,
			"yellowfinPath": yellowfinPath,
			"yellowfinReportPath": yellowfinReportPath
		};
	};
	
	this.getLoginToken = function (callback) {
		Logger.log("Received getLoginToken call");
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
				let responseData = soapResponse.toJSON();
				try {
	
					if (responseData["#document"]["S:Envelope"]["S:Body"]["ns2:remoteAdministrationCallResponse"]["return"]["statusCode"] === "SUCCESS") {
						callback(null, responseData["#document"]["S:Envelope"]["S:Body"]["ns2:remoteAdministrationCallResponse"]["return"]["loginSessionId"]);
						Logger.log("Sending response: ", responseData["#document"]["S:Envelope"]["S:Body"]["ns2:remoteAdministrationCallResponse"]["return"]["loginSessionId"]);
					} else {
						let msg = "YellowFin Webservice request (LOGINUSER) was not successful! Response: " + responseData["#document"]["S:Envelope"]["S:Body"]["ns2:remoteAdministrationCallResponse"]["return"]["statusCode"];
						Logger.error(msg);
						callback(msg, null);
					}
				} catch (err) {
					let msg = "Caught an error when using the YellowFin webservice (LOGINUSER): "
					Logger.error(msg, err);
					callback("YellowFin Webservice (LOGINUSER) response did not contain expected values, response: " + JSON.stringify(responseData, undefined, 2),null); 
				}
				// if you want to have the response as JSON use soapResponse.toJSON();
				// or soapResponse.toString() to get XML string
				// or soapResponse.toXML() to get XML DOM
			},
			error: function (soapResponse) {
				let msg = "YellowFin Webservice (LOGINUSER) returned an error! response: " + JSON.stringify(soapResponse.toJSON(), undefined, 2);
				Logger.error(msg);
				callback(msg,null); 
			}
		});
	};
	
	this.getAllUserReports = function (callback) {
		Logger.log("Received getAllUserReports call");
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
				let responseData = soapResponse.toJSON();
				try {
					if (responseData["#document"]["S:Envelope"]["S:Body"]["ns2:remoteAdministrationCallResponse"]["return"]["statusCode"] == "SUCCESS") {
						Logger.log("Sending response: ", responseData["#document"]["S:Envelope"]["S:Body"]["ns2:remoteAdministrationCallResponse"]["return"]["reports"]);
						callback(null, responseData["#document"]["S:Envelope"]["S:Body"]["ns2:remoteAdministrationCallResponse"]["return"]["reports"]);
					} else {
						let errmsg = "YellowFin Webservice request (GETALLUSERREPORTS) was not successful! Response: " + responseData["#document"]["S:Envelope"]["S:Body"]["ns2:remoteAdministrationCallResponse"]["return"]["statusCode"];
						Logger.error(errmsg);
						callback(msg, null);
					}
				} catch (err) {
					let msg = "Caught an error when using the YellowFin webservice (GETALLUSERREPORTS): "
					Logger.error(msg, err);
					callback("YellowFin Webservice (GETALLUSERREPORTS) response did not contain expected values, response: " + JSON.stringify(responseData, undefined, 2), null); 
				}
				// if you want to have the response as JSON use soapResponse.toJSON();
				// or soapResponse.toString() to get XML string
				// or soapResponse.toXML() to get XML DOM
			},
			error: function (soapResponse) {
				let msg = "YellowFin Webservice (GETALLUSERREPORTS) returned an error! response: " + JSON.stringify(soapResponse.toJSON(), undefined, 2);
				Logger.error(msg);
				callback(msg,null); 
			}
		});
	};

	return this;
}

yellowfin2Service.prototype = new baseService({
	startupDependencies: {
		services: ["dockingService", "authenticationService", "routerService"]
	}
});
let serviceInstance = new yellowfin2Service('yellowfin2Service');
serviceInstance.onBaseServiceReady(function (callback) {
	Logger.start();

	//Set up SOAP client
	//npm install -PD jquery
	//npm install -PD jquery.soap
	//npm install -PD jquery-xml2json
	// Logger.info("Adding PubSub responder for server detailsl");
	// RouterClient.addPubSubResponder("yellowFinServer", serviceInstance.getServerDetails());

	Logger.log("Adding general purpose Query responder");
	RouterClient.addResponder("YF server", function(error, queryMessage) {
		if (!error) {
			Logger.log('YF server Query: ' + JSON.stringify(queryMessage));

			if (queryMessage.data.query === "server details") {
				queryMessage.sendQueryResponse(null, serviceInstance.getServerDetails());

			} else if (queryMessage.data.query === "login token") {
				serviceInstance.getLoginToken(function(err, token) {
					// if (err) {
					// 	queryMessage.sendQueryResponse(null, {loginToken: token});
					// } else {
					// 	queryMessage.sendQueryResponse(err, null);
					// }
					queryMessage.sendQueryResponse(err, token);
				});

			} else if  (queryMessage.data.query === "all reports") {
				serviceInstance.getAllUserReports(function(err, reports) {
					// if (err) {
					// 	queryMessage.sendQueryResponse(null, {"reports": reports});
					// } else {
					// 	queryMessage.sendQueryResponse(err, null);
					// }
					queryMessage.sendQueryResponse(err, reports);
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