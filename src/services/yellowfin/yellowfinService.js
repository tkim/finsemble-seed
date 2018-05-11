
const Finsemble = require("@chartiq/finsemble");
const $ = require("jquery");
$.xml2json = require("jquery-xml2json");
$.soap = require("jquery.soap");

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
const SearchClient = Finsemble.Clients.SearchClient;
SearchClient.initialize();
const LauncherClient = Finsemble.Clients.LauncherClient;
LauncherClient.initialize();

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

	this.providerSearchFunction = function (params, callback) {
		// Get reports from the server
		const server = serviceInstance.getServerDetails();
		serviceInstance.getAllUserReports(server, (err, res) => {
			const results = [];
			if (err) {
				//just log it and return no results - otherwise it kills off the search provider
				Logger.error("Yellowfin search provider received an error form the YellowFin API", err);
				
			} else {

				// Filter Reports down to matches
				const matches = res.filter(item => {
					// Dumb match criteria. If report name, category or sub-category contains search text.
					const text = params.text.toLowerCase();
					return item.reportName.toLowerCase().includes(text) ||
						item.reportCategory.toLowerCase().includes(text) ||
						item.reportSubCategory.toLowerCase().includes(text)
				});
				
				// Build results from the matches
				matches.forEach(item => { 
					// Result item template
					// {
					// 	name: resultName, // This should be the value you want displayed
					// 	score: resultScore, // (optional) This is used to help order search results from multiple providers
					// 	type: "Application", // The type of data your result returns
					// 	description: "Your description here",
					// 	actions: [{ name: "Spawn" }], // (optional) Actions can be an array of actions 
					// 	tags: [] // (optional) This can be used for adding additional identifying information to your result
					// }
					const result = {
						name: item.reportName,
						score: 0,
						type: "Application",
						description: item.viewDescription,
						actions: [{ name: "Spawn", reportUUID: item.reportUUID }],
						tags: []
					};
					console.log(item);
					results.push(result);
				});
			}

			// Return results when done.
			callback(null, results);
		});
	};

	this.searchResultActionCallback = function (params) {
		Logger.log("Launching report from search result: ", params);
	
		LauncherClient.spawn("yellowfinJSComponent",
			{
				addToWorkspace: true,
				data: {
					"reportUUID": params.item.actions[0].reportUUID,
					"serverDetails": serviceInstance.getServerDetails()
				}
			}, function(err, response){
				console.log("Report showWindow error", response);
			}
		);
		//debugger;
	};

	this.providerActionCallback = function () {
		Logger.log("Spawning Yellowfin report launcher");
	
		LauncherClient.spawn("Yellowfin Report Launcher",
			{
				addToWorkspace: true,
				data: {
					"serverDetails": serviceInstance.getServerDetails()
				}
			}, function(err, response){
				console.log("Report showWindow error", response);
			}
		);
		//debugger;
	};
	return this;
}

yellowfinService.prototype = new baseService({
	startupDependencies: {
		clients: ["searchClient", "launcherClient"],
		services: ["authenticationService", "routerService"]
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

	Logger.log("Adding Yellowfin search provider");
	SearchClient.register(
		{
			name: "Yellowfin Reports",
			searchCallback: serviceInstance.providerSearchFunction,
			itemActionCallback: serviceInstance.searchResultActionCallback,	
			providerActionCallback: serviceInstance.providerActionCallback,
			providerActionTitle: "more yellowfin reports"
		},
		function (err) {
			console.log("Yellowfin search provider registration succeeded");
		});

	Logger.log("yellowfin Service ready");
	console.log("> yellowfin Service ready");
	callback();
});

serviceInstance.start();
window.yellowfin = serviceInstance;