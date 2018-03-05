//host config - to move elsewhere
var yellowfinProtocol = "http://";
var yellowfinHost = "localhost";
var yellowfinPort = "8081";
var yellowfinPath = "/JsAPI"
var yellowfinReportPath = "/JsAPI?api=reports"

//JQuery
var $ = require("jquery");

//state - to switch to API loading
var reports = [
	['32384c5a-7892-4ecb-93be-dc1efbdb7edd','Revenue by media category']
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
			addToWorkspace: true,
			data: {"reportUUID": data["reportUUID"]}
		}, function(err, response){
			console.log("Report showWindow error", response);
		}
	);
};

FSBL.addEventListener('onReady', function () {
	var reportTemplate = $("template")[0];

	$("#reports").empty();
	for (let report of reports) {
		console.log("report row: " + JSON.stringify(report));
		var report_row = $(document.importNode(reportTemplate.content, true));
		report_row.find("description").text(report[1]);
		report_row.find("reportUUID").text(report[0]);
		
		report_row.find("description").parent().click({"reportUUID": report[0]}, clickReport);
		$("#reports").append(report_row);
	}


});