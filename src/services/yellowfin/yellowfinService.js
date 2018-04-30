
const Finsemble = require("@chartiq/finsemble");
const $ = require("jquery");
$.xml2json = require("jquery-xml2json");
$.soap = require("jquery.soap");

// //defaults
// let yellowfinProtocol = "http://";
// let yellowfinHost = "localhost";
// let yellowfinPort = "8081";
// let yellowfinPath = "/JsAPI";
// let yellowfinReportPath = "/JsAPI?api=reports";
// let yellowfinUser = "admin@yellowfin.com.au";
// let yellowfinPass = "test";

// yellowfin demo data
let yellowfinProtocol = "http://";
let yellowfinHost = "18.130.26.97";
let yellowfinPort = "80";
let yellowfinPath = "/JsAPI";
let yellowfinReportPath = "/JsAPI?api=reports";
let yellowfinAdminUser = "admin@yellowfin.com.au";
let yellowfinAdminPass = "test";
let yellowfinUser = "consumer@yellowfin.bi";
let yellowfinPass = "test";


const RouterClient = Finsemble.Clients.RouterClient;
const baseService = Finsemble.baseService;
const Logger = Finsemble.Clients.Logger;
Logger.start();

/**
 * The yellowfin Service receives calls from the yellowfinClient.
 * @constructor
 */
function yellowfinService() {

	this.getServerDetails = function () {
		Logger.log("Received getServerDetails call");
		
		return {
			"yellowfinProtocol": 	yellowfinProtocol,
			"yellowfinHost":	 	yellowfinHost,
			"yellowfinPort": 		yellowfinPort,
			"yellowfinPath": 		yellowfinPath,
			"yellowfinReportPath": 	yellowfinReportPath,
			"yellowfinAdminUser": 	yellowfinAdminUser,
			"yellowfinAdminPass": 	yellowfinAdminPass,
			"yellowfinUser": 		yellowfinUser,
			"yellowfinPass": 		yellowfinPass
		};
	};
	
	this.getLoginToken = function (serverDeets, callback) {
		Logger.log("Received getLoginToken call");
		$.soap({
			url: serverDeets.yellowfinProtocol + serverDeets.yellowfinHost + ':' + serverDeets.yellowfinPort + '/webservices/LegacyAdministrationService',
			method: 'web:remoteAdministrationCall',
			appendMethodToURL: false,
			envAttributes: {'xmlns:web': 'http://webservices.web.mi.hof.com/'},
			data: {
				arg0: {
					function: 'LOGINUSER',
					loginId: serverDeets.yellowfinAdminUser,
					orgId: 1,
					password:serverDeets. yellowfinAdminPass,
					person: {
						userId: serverDeets.yellowfinUser,
						password: serverDeets.yellowfinPass
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
						let msg = "Yellowfin Webservice request (LOGINUSER) was not successful! Response: " + responseData["#document"]["S:Envelope"]["S:Body"]["ns2:remoteAdministrationCallResponse"]["return"]["statusCode"];
						Logger.error(msg);
						callback(msg, null);
					}
				} catch (err) {
					let msg = "Caught an error when using the Yellowfin webservice (LOGINUSER): "
					Logger.error(msg, err);
					callback("Yellowfin Webservice (LOGINUSER) response did not contain expected values, response: " + JSON.stringify(responseData, undefined, 2),null); 
				}
				// if you want to have the response as JSON use soapResponse.toJSON();
				// or soapResponse.toString() to get XML string
				// or soapResponse.toXML() to get XML DOM
			},
			error: function (soapResponse) {
				let msg = "Yellowfin Webservice (LOGINUSER) returned an error! response: " + JSON.stringify(soapResponse.toJSON(), undefined, 2);
				Logger.error(msg);
				callback(msg,null); 
			}
		});
	};
	
	this.getAllUserReports = function (serverDeets, callback) {
		Logger.log("Received getAllUserReports call");
		$.soap({
			url: serverDeets.yellowfinProtocol + serverDeets.yellowfinHost + ':' + serverDeets.yellowfinPort + '/webservices/LegacyAdministrationService',
			method: 'web:remoteAdministrationCall',
			appendMethodToURL: false,
			envAttributes: {'xmlns:web': 'http://webservices.web.mi.hof.com/'},
			data: {
				arg0: {
					function: 'GETALLUSERREPORTS',
					loginId: serverDeets.yellowfinAdminUser,
					orgId: 1,
					password: serverDeets.yellowfinAdminPass,
					person: {
						userId: serverDeets.yellowfinUser,
						password: serverDeets.yellowfinPass
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
						let errmsg = "Yellowfin Webservice request (GETALLUSERREPORTS) was not successful! Response: " + JSON.stringify(soapResponse, undefined, 2);
						Logger.error(errmsg);
						callback(msg, null);
					}
				} catch (err) {
					let msg = "Caught an error when using the Yellowfin webservice (GETALLUSERREPORTS): "
					Logger.error(msg, err);
					callback("Yellowfin Webservice (GETALLUSERREPORTS) response did not contain expected values, response: " + JSON.stringify(soapResponse, undefined, 2), null); 
				}
				// if you want to have the response as JSON use soapResponse.toJSON();
				// or soapResponse.toString() to get XML string
				// or soapResponse.toXML() to get XML DOM
			},
			error: function (soapResponse) {
				let msg = "Yellowfin Webservice (GETALLUSERREPORTS) returned an error! response: " + JSON.stringify(soapResponse, undefined, 2);
				Logger.error(msg);
				callback(msg,null); 
			}
		});
	};

	this.getReportHtml = function (serverDeets, reportId, filters, callback) {
		Logger.log("Received getReportHtml call");
		let args = {
			arg0: {
				reportRequest: 'HTML',
				loginId: serverDeets.yellowfinAdminUser,
				orgId: 1,
				password: serverDeets.yellowfinAdminPass,
				reportId: reportId
				// person: {
				// 	userId: yellowfinUser,
				// 	password: yellowfinPass
				// }
			}
		};
		if (filters){ 
			args[args0].filters = filters;
		}
		
		$.soap({
			url: serverDeets.yellowfinProtocol + serverDeets.yellowfinHost + ':' + serverDeets.yellowfinPort + '/webservices/LegacyReportService',
			method: 'web:remoteReportCall',
			appendMethodToURL: false,
			envAttributes: {'xmlns:web': 'http://webservices.web.mi.hof.com/'},
			data: {
				args
			},
			success: function (soapResponse) {
				let responseData = soapResponse.toJSON();
				Logger.log('Response: ' + JSON.stringify(responseData));
				try {
	
					if (responseData["#document"]["S:Envelope"]["S:Body"]["ns2:tns:remoteReportCallResponse"]["return"]["statusCode"] === "SUCCESS") {
						callback(null, responseData["#document"]["S:Envelope"]["S:Body"]["ns2:tns:remoteReportCallResponse"]["return"]["ReportBinaryObject"]);
						Logger.log("Sending response: ", responseData["#document"]["S:Envelope"]["S:Body"]["ns2:remoteReportCallResponse"]["return"]["ReportBinaryObject"]);
					} else {
						let msg = "Yellowfin Webservice report request (HTML) was not successful! Response: " + responseData["#document"]["S:Envelope"]["S:Body"]["ns2:remoteReportCallResponse"]["return"]["ReportBinaryObject"];
						Logger.error(msg);
						callback(msg, null);
					}
				} catch (err) {
					let msg = "Caught an error when using the Yellowfin webservice (HTML): "
					Logger.error(msg, err);
					callback("Yellowfin Webservice Report response (HTML) did not contain expected values, response: " + JSON.stringify(responseData, undefined, 2),null); 
				}
			},
			error: function (soapResponse) {
				let msg = "Yellowfin Webservice Report service (HTML) returned an error! response: " + JSON.stringify(soapResponse.toJSON(), undefined, 2);
				Logger.error(msg);
				callback(msg,null); 
			}
		});
	};

	return this;
}

yellowfinService.prototype = new baseService({
	startupDependencies: {
		services: ["dockingService", "authenticationService", "routerService"]
	}
});
let serviceInstance = new yellowfinService('yellowfinService');
serviceInstance.onBaseServiceReady(function (callback) {
	

	//Set up SOAP client
	//npm install -PD jquery
	//npm install -PD jquery.soap
	//npm install -PD jquery-xml2json
	
	Logger.log("Adding general purpose Query responder");
	RouterClient.addResponder("YF server", function(error, queryMessage) {
		if (!error) {
			Logger.log('YF server Query: ' + JSON.stringify(queryMessage));

			if (queryMessage.data.query === "server details") {
				queryMessage.sendQueryResponse(null, serviceInstance.getServerDetails());

			} else if (queryMessage.data.query === "login token") {
				let server = queryMessage.data.server ? queryMessage.data.server : serviceInstance.getServerDetails();
				serviceInstance.getLoginToken(server, queryMessage.sendQueryResponse);

			} else if  (queryMessage.data.query === "all reports") {

				let server = queryMessage.data.server ? queryMessage.data.server : serviceInstance.getServerDetails();
				serviceInstance.getAllUserReports(server, queryMessage.sendQueryResponse);

			} else if  (queryMessage.data.query === "report html") {
				let server = queryMessage.data.serverDetails ? queryMessage.data.serverDetails : serviceInstance.getServerDetails();
				serviceInstance.getReportHtml(server, queryMessage.data.reportId, queryMessage.data.filters, queryMessage.sendQueryResponse);

			} else {
				queryMessage.sendQueryResponse("Unknown query function: " + queryMessage, null);
				Logger.error("Unknown query function: ", queryMessage);
			}
		} else {
			Logger.error("Failed to setup query responder", error);
		}
	});

	Logger.log("yellowfin Service ready");
	console.log("> yellowfin Service ready");
	callback();
});

serviceInstance.start();
window.yellowfin = serviceInstance;