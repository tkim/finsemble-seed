//host config - to move elsewhere
// var yellowfinProtocol = "http://";
// var yellowfinHost = "localhost";
// var yellowfinPort = "8081";
// var yellowfinPath = "/JsAPI";
// var yellowfinReportPath = "/JsAPI?api=reports";

var yellowfinProtocol = "http://";
var yellowfinHost = "35.178.45.11";
var yellowfinPort = "80";
var yellowfinPath = "/JsAPI";
var yellowfinReportPath = "/JsAPI?api=reports";

//JQuery
var $ = require("jquery");

//state - to switch to API loading
var reports = [
	// ['32384c5a-7892-4ecb-93be-dc1efbdb7edd','Revenue by media category'],
	// ['879d3175-1d40-4495-a4d4-45a24e781e53','Invoice vs. Estimate'],
	// ['ce3c4461-ea36-427d-bcd4-72448ec2722c','Revenue by Campaign and Demographic']

	['fe761a5e-db8d-4c55-9ff6-e5879519f57b','Stocks 1'],
	['f6aecf28-ba9b-4478-8890-89e01100c495','Stocks 2'],
	['e1f168de-9710-4cc3-b67f-18af05d994ff','Stocks 3'],
	['5176f636-29b2-4b38-bd6a-deee157d4df9','Stocks 4'],
	['996525dc-8723-4d9f-bc73-05705f9c7b5f','Stocks 5'],
	['758b1bc7-7565-489e-ac86-c70f740d3045','Stocks 6']
];
var dashboards = [

];

var clickReport = function(event) {
	console.log("clickReport: " + JSON.stringify(event.data));
	var data = event.data;

	console.log("Launching report: ", data["reportUUID"]);

	FSBL.Clients.LauncherClient.spawn("yellowFinJSComponent",
		{
			position: "relative",
			left: "adjacent",
			top: 0,
			addToWorkspace: true,
			data: {
				"reportUUID": data["reportUUID"],
				"yellowfinProtocol": yellowfinProtocol,
				"yellowfinHost": yellowfinHost,
				"yellowfinPort": yellowfinPort,
				"yellowfinPath": yellowfinPath,
				"yellowfinReportPath": yellowfinReportPath
			}
		}, function(err, response){
			console.log("Report showWindow error", response);
		}
	);
};

FSBL.addEventListener('onReady', function () {
	var reportTemplate = $("template")[0];

	// //get YellowFinCLient if we're using it
	// var Yellowfin2Client = require('../../clients/yellowfin2Client');
	// console.log("yellowfin2Client: " + JSON.stringify(Yellowfin2Client));	
	// var serverDetails = Yellowfin2Client.getServerDetails();

	FSBL.Clients.RouterClient.subscribe("yellowFinServer", function(error, notify) {
		if (error) {
			console.log("yellowFinServer Subscribe Error:" + JSON.stringify(error));
		} else {

			console.log("yellowfin server data: ", notify);

			var serverDetails = notify.data;
			yellowfinProtocol = serverDetails.yellowfinProtocol;
			yellowfinHost = serverDetails.yellowfinHost;
			yellowfinPort = serverDetails.yellowfinPort;
			yellowfinPath = serverDetails.yellowfinPath;
			yellowfinReportPath = serverDetails.yellowfinReportPath;

			console.log("yellowfinProtocol", yellowfinProtocol);
			console.log("yellowfinHost", yellowfinHost);
			console.log("yellowfinPort", yellowfinPort);
			console.log("yellowfinPath", yellowfinPath);
			console.log("yellowfinReportPath", yellowfinReportPath);
			
			$("#reports").empty();
			for (let report of reports) {
				console.log("report row: " + JSON.stringify(report));
				var report_row = $(document.importNode(reportTemplate.content, true));
				report_row.find("description").text(report[1]);
				report_row.find("reportUUID").text(report[0]);
				
				report_row.find("description").parent().click({"reportUUID": report[0]}, clickReport);
				$("#reports").append(report_row);
			}

		}
	});
});