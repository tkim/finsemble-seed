//JQuery (can't get ES6 import to work for this yet)
const $ = require("jquery");
const Logger = FSBL.Clients.Logger;
import {getServerDetails, getLoginToken, getAllUserReports} from '../../clients/yellowfin2Client';

let serverDetails = {
	yellowfinProtocol: "http://",
	yellowfinHost: "localhost",
	yellowfinPort: "8081",
	yellowfinPath: "/JsAPI",
	yellowfinReportPath: "/JsAPI?api=reports",
	yellowfinUser: "admin@yellowfin.com.au",
	yellowfinPass: "test"
};
let reports = [];
let dashboards = [];



FSBL.addEventListener('onReady', function () {
	
	let reportTemplate = $("template")[0];

	let clickReport = function(event) {
		Logger.info("clickReport: " + JSON.stringify(event.data, undefined, 2));
		let data = event.data;
	
		Logger.log("Launching report: ", data["reportUUID"]);
	
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
	
	let clickAddReport = function(event) {
		Logger.info("clickAddReport: " + JSON.stringify(event.data, undefined, 2));
		let data = event.data;
	
		Logger.log("Launching report creator");
	
		FSBL.Clients.LauncherClient.spawn("yellowFin",
			{
				left: "center",
				top: "center",
				addToWorkspace: true,
				data: {
					"destination": "CREATEREPORT",
					"server": serverDetails
				}
			}, function(err, response){
				console.log("Report showWindow error", response);
			}
		);
	};
	
	let getReports = function() {
		getAllUserReports(serverDetails, function(err, reportData) {
			if (err) {
				Logger.error("Failed to retrieve user reports: ", err);
			} else {
				$("#reports").empty();
				Logger.log("reports: " + JSON.stringify(reportData, undefined, 2));	
	
				reportData.forEach(report => {
					reports.push(report);
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

	$('.header #refreshButton').click(getReports);
	$('.header #addButton').click(clickAddReport);

	FSBL.Clients.WindowClient.setWindowTitle(`YellowFin (${serverDetails.yellowfinHost}:${serverDetails.yellowfinPort})`);

	Logger.log("serverDetails: " + JSON.stringify(serverDetails, undefined, 2));	

	getReports();
}); 