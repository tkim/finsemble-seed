//host config - to move elsewhere
// var yellowfinProtocol = "http://";
// var yellowfinHost = "localhost";
// var yellowfinPort = "8081";
// var yellowfinPath = "/JsAPI";
// var yellowfinReportPath = "/JsAPI?api=reports";

// var yellowfinProtocol = "http://";
// var yellowfinHost = "35.178.45.11";
// var yellowfinPort = "80";
// var yellowfinPath = "/JsAPI";
// var yellowfinReportPath = "/JsAPI?api=reports";

//JQuery (can't get ES6 import to work for this yet)
const $ = require("jquery");
const Logger = FSBL.Clients.Logger;
import {getServerDetails, getLoginToken, getAllUserReports} from '../../clients/yellowfin2Client';

let serverDetails = null;
let reports = [];
let dashboards = [];

let clickReport = function(event) {
	console.log("clickReport: " + JSON.stringify(event.data));
	let data = event.data;

	console.log("Launching report: ", data["reportUUID"]);

	FSBL.Clients.LauncherClient.spawn("yellowFinJSComponent",
		{
			position: "relative",
			left: "adjacent",
			top: 0,
			addToWorkspace: true,
			data: {
				"reportUUID": data["reportUUID"],
				"serverDetails": serverDetails
			}
		}, function(err, response){
			console.log("Report showWindow error", response);
		}
	);
};

FSBL.addEventListener('onReady', function () {
	FSBL.Clients.WindowClient.setWindowTitle("Report Launcher (localhost)");
	let reportTemplate = $("template")[0];
	
	getServerDetails(function(err,server) {
		if (err) {
			Logger.error("Failed to retrieve server details: ", err);
		} else {
			serverDetails = server;
			Logger.log("serverDetails: " + JSON.stringify(serverDetails, undefined, 2));	

			getAllUserReports(function(err, reportData) {
				if (err) {
					Logger.error("Failed to retrieve user reports: ", err);
				} else {
					$("#reports").empty();
					//Logger.log("reports: " + JSON.stringify(reportData, undefined, 2));	

					reportData.forEach(report => {
						reports.push(report);
						console.log("report row: " + JSON.stringify(report));
						let report_row = $(document.importNode(reportTemplate.content, true));
						 
						report_row.find("description").text(report.reportName );
						report_row.find("category").text(report.reportSubCategory ? `${report.reportCategory}: ${report.reportSubCategory}` : report.reportCategory);
						report_row.find("reportUUID").text(report.reportUUID);
						report_row.find("description").parent().click({"reportUUID": report.reportUUID}, clickReport);
						$("#reports").append(report_row);
					});
				}
			});
		}
	});
});