//JQuery
const Logger = FSBL.Clients.Logger;

//state
let serverDetails = null;
let reportUUID = null;
let filtersSelected = {};
let filterArr = [];

let yfLoaded = false;
let yfReportsLoaded = false;

function setFilters(fromParent) {
	$("filtervalue").removeClass("selected");
	for (let filter of filterArr) {
		let filterBlock = $('filter filterUUID:contains(' + filter.filterUUID + ')').parent();
		Logger.log("filter: " + filterBlock.find('filterUUID').text());
		if (filter.list && filter.listValues){
			//category filter
			if (filtersSelected[filter.filterUUID]) {
				filterBlock.find('values filtervalue').each(function () {
					Logger.log("value: " + $( this ).find('label description').text());
					if (filtersSelected[filter.filterUUID].includes($( this ).find('label description').text())) {
						$( this ).addClass("selected");
					}
				});
			}		
		} else if (filter.list) {
			//string filter
			if (filtersSelected[filter.filterUUID]) {
				filterBlock.find('values filtertext label input').text(filtersSelected[filter.filterUUID]);
			}		
		} else if (filter.between){
			//between filter
			if (filtersSelected[filter.filterUUID]) {
				filterBlock.find('values filterbetween label input.from').text(filtersSelected[filter.filterUUID].from);
				filterBlock.find('values filterbetween label input.to').text(filtersSelected[filter.filterUUID].to);
			}	
		}
	}
	//publish selected filters
	if (!fromParent) {
		FSBL.Clients.RouterClient.transmit(FSBL.Clients.WindowClient.options.name, filtersSelected);
	}
	//save to filter panel state
	setState();
}

function clickFilter(event) {
	Logger.log("clickFilter: " + JSON.stringify(event.data));
	let data = event.data;
	if (!filtersSelected[data[0]]) {
		filtersSelected[data[0]] = [data[1].value];
	} else if (filtersSelected[data[0]].includes(data[1].value)){
		filtersSelected[data[0]].splice(filtersSelected[data[0]].indexOf(data[1].value),1);
	} else {
		filtersSelected[data[0]].push(data[1].value);
	}

	Logger.log("filters selected: " + JSON.stringify(filtersSelected));
	//highlight selected filters
	setFilters();
}

function textFilterApply(event) {
	Logger.log("textFilterApply: " + JSON.stringify(event.data));
	let data = event.data;
	if (data[1]) {
		filtersSelected[data[0]] = data[1].val();
	} else {
		delete filtersSelected[data[0]];
	}

	Logger.log("filters selected: " + JSON.stringify(filtersSelected));
	//highlight selected filters
	setFilters();
}


function betweenFilterApply(event) {
	Logger.log("betweenFilterApply: " + JSON.stringify(event.data));
	let data = event.data;
	if (data[1] && data[2]) {
		filtersSelected[data[0]] = [data[1].val(), data[2].val()];
	} else {
		delete filtersSelected[data[0]];
	}

	Logger.log("filters selected: " + JSON.stringify(filtersSelected));
	//highlight selected filters
	setFilters();
}

function renderPage() {
	let filter_template = $("template")[0];
	let value_template = $("template")[1];
	let between_template = $("template")[2];
	let freetext_template = $("template")[3];
	let none_template = $("template")[4];
	$("#filters").empty();
	if (filterArr && filterArr.length > 0) {
		for (let filter of filterArr) {
			Logger.log("filter row: " + JSON.stringify(filter));
			let filt_row = $(document.importNode(filter_template.content, true));
			filt_row.find("description").text(filter.description);
			filt_row.find("filterUUID").text(filter.filterUUID);

			let vals = filt_row.find("values");
			if (filter.list && filter.listValues){
				for (let value of filter.listValues) {
					let val_row = $(document.importNode(value_template.content, true));
					val_row.find("description").text(value.value);
					val_row.find("description").parent().parent().click([filter.filterUUID, value], clickFilter);
					vals.append(val_row);
				}
			} else if (filter.list) {
				let freetext_row = $(document.importNode(freetext_template.content, true));
				let inputbox = freetext_row.find("label input");
				freetext_row.find("button").click([filter.filterUUID, inputbox], textFilterApply);
				vals.append(freetext_row);

			} else if (filter.between){
				let between_row = $(document.importNode(between_template.content, true));
				let inputboxFrom = between_row.find("label input.from");
				let inputboxTo = between_row.find("label input.to");
				between_row.find("button").click([filter.filterUUID, inputboxFrom, inputboxTo], betweenFilterApply);
				vals.append(between_row);

				//TODO: add an onchanged action
				//val_row.find("description").parent().click([filter.filterUUID, value], clickFilter);
			} else {
				vals.append("<div>Unkown filter type</div>");
			}
			$("#filters").append(filt_row);
		}
	} else {
		let none_row = $(document.importNode(none_template.content, true));
		$("#filters").append(none_row);
	}
	Logger.log("filters selected after page render: " + JSON.stringify(filtersSelected));
}

/**
 * Sets the state of a component to the Workspace
 */
function setState() {
	let state = {
		"filtersSelected": filtersSelected,
		"filterArr": filterArr,
		"reportUUID": reportUUID,
		"serverDetails": serverDetails
	};
	FSBL.Clients.WindowClient.setComponentState({ field: 'reportState', value: state });
}

/**
 * Gets the the stored state of a component
 */
function getState() {
	FSBL.Clients.WindowClient.getComponentState({
		field: 'reportState',
	}, function (err, state) {
		if (!state) {
			return;
		}

		filtersSelected = state.filtersSelected;
		filterArr = state.filterArr;
		reportUUID = state.reportUUID;
		serverDetails = state.serverDetails;
	});
}

/**
 * Everything needs to happen after Finsemble is ready
 */
FSBL.addEventListener("onReady", function () {
	FSBL.Clients.WindowClient.setWindowTitle("Report Filters");
	getState(); 

	//get spawing data to set report ID
	let spawnData = FSBL.Clients.WindowClient.getSpawnData();
	Logger.log("Spawn data: " + JSON.stringify(spawnData));
	if (spawnData){
		if (spawnData.reportUUID) { 
			reportUUID = spawnData.reportUUID;
			Logger.log("Set reportUUID: " + JSON.stringify(reportUUID)); 
		}
		if (spawnData.filtersSelected) { 
			filtersSelected = spawnData.filtersSelected; 
			Logger.log("Set filtersSelected: " + JSON.stringify(filtersSelected)); 
		}
		if (spawnData.serverDetails) {
			serverDetails = spawnData.serverDetails;
		}
	}

	//Listen to instructions from report panel
	let parent = FSBL.Clients.WindowClient.options.name.substring(0,FSBL.Clients.WindowClient.options.name.lastIndexOf("."));
	FSBL.Clients.RouterClient.addListener(parent, function (err, response) {
		if (err) return;
		filtersSelected = response.data;
		setFilters(true);
	});
	
	//load YellowFin API from host
	let yellowfinScr = document.createElement('script');
	yellowfinScr.setAttribute('src', serverDetails.yellowfinProtocol + serverDetails.yellowfinHost + ":" + serverDetails.yellowfinPort + serverDetails.yellowfinPath);
	yellowfinScr.setAttribute('type','text/javascript');

	let yellowfinReportScr = document.createElement('script');
	yellowfinReportScr.setAttribute('src', serverDetails.yellowfinProtocol + serverDetails.yellowfinHost + ":" + serverDetails.yellowfinPort + serverDetails.yellowfinReportPath);
	yellowfinReportScr.setAttribute('type','text/javascript');

	function filterCallback(filters) {
		Logger.log("Num filters: " + filters.length)
		filterArr = filters;
		renderPage();
		setFilters(true);
	 }

	/*
		Check if YellowFin scripts have loaded and setup the report filters.
	*/
	function checkLoaded() {
		if(yfLoaded && yfReportsLoaded) {
			//load filters for a particular report
			window.yellowfin.reports.loadReportFilters(reportUUID, filterCallback);
		}
	}

	//retrieve and inject report HTML when API loaded (wait on last script added to DOM)
	yellowfinScr.onload = function () {
		yfLoaded = true;
		checkLoaded();
	};
	yellowfinReportScr.onload = function () {
		yfReportsLoaded = true;
		checkLoaded();
	};

	document.body.appendChild(yellowfinScr);
	document.body.appendChild(yellowfinReportScr);
});