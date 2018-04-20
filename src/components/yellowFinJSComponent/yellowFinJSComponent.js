//N.B. JQuery is included in HTML
const Logger = FSBL.Clients.Logger;
//YellowFin service functions
import {getServerDetails, getLoginToken, getAllUserReports} from '../../clients/yellowfinClient';

const FILTER_TOPIC = 'yellowfin_filters';

//state
let filtersSelected = {};
let filterArr = [];
let reportUUID = null;
let serverDetails = null;

let userOpts = null;
let resizeId;
let elementId = 'yellowfinContainer';
let filtersSetup = false;
let yfLoaded = false;
let yfReportsLoaded = false;
let loginToken = null;
let myWindowIdentifier;

//DOM entries for YellowFin scripts
let yellowfinScr = document.createElement('script');
let yellowfinReportScr = document.createElement('script');
let yellowfinScrSrc = null; 
let yellowfinReportScrSrc = null; 
	
/**
 * Sets the state of a component to the Workspace
 */
function setState() {
	let state = {
		"filtersSelected": filtersSelected,
		"filterArr": filterArr,
		"reportUUID": reportUUID,
		"serverDetails": serverDetails,
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

/*
Load the YellowFin report and inject it into the component
*/
function injectReport(uuid, elementId, opts) {
	if (opts) {
		//disallow forcing width and height so that we respond to window size
		if (opts.width) { delete opts.width;}
		if (opts.height) { delete opts.height;}
		userOpts = opts;
	}
	let options = {};
	//default options
	options.reportUUID = uuid;
	options.elementId = elementId;
	options.showFilters = 'false';
	options.showSeries = 'true';
	options.display = 'chart';
	options.fitTableWidth = 'true';
	options.showTitle = 'true';

	//we use the admin username and password for auth as SSO token auth causes some issues 
	//  with report embedding and changes the script URLs 
	// (which is awkward after the DOM is closed as YF doesn't use DOM manipulation)
	options.username = serverDetails.yellowfinUser;
	options.password = serverDetails.yellowfinPass;

	options.width = $(window).width();
	options.height = $(window).height();

	//account for finsemble header if injected
	if (FSBL.Clients.WindowClient.options.customData.foreign.components["Window Manager"].FSBLHeader){
		options.height -= 32;
	}
	//add space for yf title if enabled
	if (options.showTitle === 'true'){
		options.height -= 30;
	}
	
	// //add space for breadcrumbs in case user drills down 
	// // - disabled as YF seems to include in the containing div but doesn't account for it in sizing calculations
	// // - awaiting comment from YF
	// // - 27 Feb 18: Confirmed that it will need a fix on YF end - affects drill down reports only
	// options.height -= 30;

	//add space for yf footer
	options.height -= 5;

	//leave space for filter button
	options.height -= 30;

	//apply any options passed
	if (userOpts) {
		for (let key in userOpts) {
			options[key] = userOpts[key];
		}
	}

	if (Object.keys(filtersSelected).length > 0){
		options.filters = filtersSelected;
	}

	Logger.log("yellowfin options: ", options)
	window.yellowfin.loadReport(options);

	//Window title hack - discussing adding a callback to YF JS API so we know when report is loaded AND to receive report metadata
	let setTitle = function() {
		if ($('div.yfReportTitle').length > 0){
			FSBL.Clients.WindowClient.setWindowTitle($('div.yfReportTitle').text());
			$('div.yfReportTitle').hide();
		} else {
			setTimeout(setTitle, 100);
		}
	};
	//only enable if the title actually exists!
	if (options.showTitle === 'true'){
		setTimeout(setTitle, 100);
	}

	//load any filters - delay as it happens more stably once report is loaded and theres no callback on YF report load
	setTimeout(
		function() {
			if (!filterArr || filterArr.length == 0){
				window.yellowfin.reports.loadReportFilters(uuid, function(filters) { filterCallback(filters, userOpts); });
			}
		},
		120);

	setState();
};

/*
  Receives filter information from the YellowFin API and subscribes for linking
  and Filter panel inputs.
*/
function filterCallback(filters, userOpts) {
	if (filters && filters.length) { 
		let filtersStr = "";
		for (filt in filters) {
			filtersStr += `|${filt.description}| `;
		}
		Logger.log("Filters: " + filtersStr);
		filterArr = filters;
	} else {
		Logger.log("filterCallback: No filters returned!");
	}
}

function publishFilters() {
	let out = {};
	for (let i = 0; i < filterArr.length; i++) {
		if (filtersSelected[filterArr[i].filterUUID]){
			out[filterArr[i].description] = filtersSelected[filterArr[i].filterUUID];
		} else {
			out[filterArr[i].description] = [];
		}
		FSBL.Clients.LinkerClient.publish({
			dataType: FILTER_TOPIC, 
			data: {triggerComp: FSBL.Clients.WindowClient.options.name, filtersSelected: out}
		});
	}
}

/*
	Display a slaved filter panel component.
*/
function showFilterPanel() {
	let windowIdentifier={
		componentType: "yellowFinFilterComponent",
		windowName: FSBL.Clients.WindowClient.options.name + ".filter"
	};

	FSBL.Clients.LauncherClient.showWindow(windowIdentifier,
		{
			position: "relative",
			addToWorkspace: true,
			left: "adjacent",
			top: 0,
			height: window.innerHeight,
			spawnIfNotFound: true,
			slave: true,
			relativeWindow: myWindowIdentifier,
			groupOnSpawn: true,
			data: {
				"reportUUID": reportUUID, 
				"filtersSelected": filtersSelected,
				"reportUUID": reportUUID,
				"serverDetails": serverDetails
			}
		}, function(err, response){
			if (err) {
				Logger.error("Filter showWindow error: ", err);
			} else {
				Logger.log("Showing filter panel " + windowIdentifier.windowName);
			}
		}
	);
}

/*
	Check if YellowFin scripts have loaded and setup the report.
*/
function checkLoaded() {
	if(yfLoaded && yfReportsLoaded) {
		injectReport(reportUUID, elementId);

		
		//reinject the report on window resize
		window.onresize = function() { 
			//only regenerate report when done resizing, 200 ms should be plenty, but may be able to shave lower
			clearTimeout(resizeId);
			resizeId = setTimeout(function() { injectReport(reportUUID, elementId); }, 200);
		};

		//setup the filter button
		$("#filterButton").click(function () {
			Logger.log("filter clicked");
			showFilterPanel();
		});

		//setup the reset button
		$("#resetButton").click(function () {
			Logger.log("reset clicked");
			filtersSelected = {};
			//reset filter panel
			FSBL.Clients.RouterClient.transmit(FSBL.Clients.WindowClient.options.name, filtersSelected);
			//publish reset
			publishFilters();
			injectReport(reportUUID, elementId);
		});


	}
}

//retrieve and inject report HTML when API loaded (wait on last script added to DOM)
yellowfinScr.onload = function () {
	yfLoaded = true;
	//checkLoaded();
	Logger.info("yellowfinReportScrSrc: " + yellowfinReportScrSrc)
	yellowfinReportScr.setAttribute('src', yellowfinReportScrSrc);
	yellowfinReportScr.setAttribute('type','text/javascript');
	document.body.appendChild(yellowfinReportScr);
};
yellowfinReportScr.onload = function () {
	yfReportsLoaded = true;
	checkLoaded();
};

FSBL.addEventListener('onReady', function () {
	FSBL.Clients.WindowClient.getWindowIdentifier(function(id) {myWindowIdentifier = id;});
	
	getState();
	
	//get spawing data to set report ID
	let spawnData = FSBL.Clients.WindowClient.getSpawnData();
	Logger.log("Spawn data: ", spawnData);
	if (spawnData){
		if (spawnData.serverDetails) {
			serverDetails = spawnData.serverDetails;
			Logger.log("Set serverDetails: ", serverDetails); 
			
			if (spawnData.reportUUID) { 
				reportUUID = spawnData.reportUUID;
				Logger.log("Set reportUUID: " + JSON.stringify(reportUUID)); 
			} else {
				Logger.error("no report details found in spawn data!");
			}
		} else {
			Logger.error("no server details found in spawn data!");
		}
	}

	yellowfinScrSrc = serverDetails.yellowfinProtocol + serverDetails.yellowfinHost + ":" + serverDetails.yellowfinPort + serverDetails.yellowfinPath;
	yellowfinReportScrSrc = serverDetails.yellowfinProtocol + serverDetails.yellowfinHost + ":" + serverDetails.yellowfinPort + serverDetails.yellowfinReportPath;

	Logger.info("yellowfinScrSrc: " + yellowfinScrSrc)
	yellowfinScr.setAttribute('src', yellowfinScrSrc);
	yellowfinScr.setAttribute('type','text/javascript');
	document.body.appendChild(yellowfinScr);

	// Logger.info("yellowfinReportScrSrc: " + yellowfinReportScrSrc)
	// yellowfinReportScr.setAttribute('src', yellowfinReportScrSrc);
	// yellowfinReportScr.setAttribute('type','text/javascript');
	// document.body.appendChild(yellowfinReportScr);

	//subscribe to filters
	FSBL.Clients.LinkerClient.subscribe(FILTER_TOPIC, function (obj) {
		Logger.log('Received filter context: ', obj);
		
		//ignore messages from ourselves
		if (obj && !(obj.triggerComp && obj.triggerComp == FSBL.Clients.WindowClient.options.name)) {
			filtersSelected = {};
			for (let i = 0; i < filterArr.length; i++) {
				let filt = filterArr[i];
				if (filt.description in obj.filtersSelected && obj.filtersSelected[filt.description].length > 0){
					//perhaps should spin through and make sure values exist for categorical filters with a list
					filtersSelected[filt.filterUUID] = obj.filtersSelected[filt.description];
				} // ignore empty filters - explicitly setting and empty array will override defaults, which omitting the element will respect
			}	
			Logger.log('Updated filter selections to: ', filtersSelected);
			//update filter panel
			FSBL.Clients.RouterClient.transmit(FSBL.Clients.WindowClient.options.name, filtersSelected);					
			//update report panel
			injectReport(reportUUID, elementId, {triggerComp: obj.triggerComp});
		} else{
			Logger.log(`Filter data transmitted by: ${obj.triggerComp}, ignored by: ${FSBL.Clients.WindowClient.options.name},`);
		}
	});
	
	//Listen to instructions from the filter panel
	FSBL.Clients.RouterClient.addListener(FSBL.Clients.WindowClient.options.name + ".filter", function (err, response) {
		if (err) return;
		filtersSelected = response.data;
		injectReport(reportUUID, elementId);

		//Publish filters for linking (only if they are set and were not triggered by another component)
		if (filterArr && filtersSelected){
			publishFilters();
		}
	});
});