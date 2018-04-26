const FILTER_TOPIC = 'yellowfin_filters';
const Logger = FSBL.Clients.Logger;

let render = function(filterContext) {
	Logger.log("Received context: ", filterContext);

	let template = $("template")[0];
	$("#filters").empty();
	if (filterContext && filterContext.filtersSelected && Object.keys(filterContext.filtersSelected).length > 0) {
		for (let filter of Object.keys(filterContext.filtersSelected)) {
			let filt_row = $(document.importNode(template.content, true));
			filt_row.find("description").text(filter + ": ");
			filt_row.find("values").text(JSON.stringify(filterContext.filtersSelected[filter]));
			$("#filters").append(filt_row);
		}
	} else {
		$("#filters").html("&lt;none&gt;");
	}
	if (filterContext.triggerComp) {
		$('#triggeredBy').text(filterContext.triggerComp);
	} else {
		$('#triggeredBy').empty();
	}
}

FSBL.addEventListener('onReady', function () {
	FSBL.Clients.WindowClient.setWindowTitle("YellowFin Filter Context");
	
	//do things with FSBL in here.
	//subscribe to filters
	FSBL.Clients.LinkerClient.subscribe(FILTER_TOPIC, function (obj) {
		render(obj);
	});
});