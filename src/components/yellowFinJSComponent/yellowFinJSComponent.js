// //host config - to move elsewhere
// let yellowfinProtocol = "http://";
// let yellowfinHost = "localhost";
// let yellowfinPort = "8081";
// let yellowfinPath = "/JsAPI";
// let yellowfinReportPath = "/JsAPI?api=reports";

//JQuery
const $ = require("jquery");
const jQuery = $;
const Logger = FSBL.Clients.Logger;
import {getServerDetails, getLoginToken, getAllUserReports} from '../../clients/yellowfin2Client';

//state
let filtersSelected = {};
let filterArr = [];
let reportUUID = null;
let serverDetails = null;

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


let myWindowIdentifier;
FSBL.addEventListener('onReady', function () {
	FSBL.Clients.WindowClient.getWindowIdentifier(function(id) {myWindowIdentifier = id;});
	
	getState();
	
	//get spawing data to set report ID
	let spawnData = FSBL.Clients.WindowClient.getSpawnData();
	Logger.log("Spawn data: " + JSON.stringify(spawnData));
	if (spawnData){
		if (spawnData.serverDetails) {
			serverDetails = spawnData.serverDetails;
			Logger.log("Set serverDetails: " + JSON.stringify(serverDetails, undefined, 2)); 
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

	let userOpts = null;
	let resizeId;
	let elementId = 'yellowfinContainer';

	let injectReport = function(uuid, elementId, opts) {
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

		options.width = $(window).width();
		options.height = $(window).height();

		//account for finsemble header if injected
		if (FSBL.Clients.WindowClient.options.customData.foreign.components["Window Manager"].FSBLHeader){
			options.height -= 32;
		}
		//add space yf title if enabled
		if (options.showTitle === 'true'){
			options.height -= 30;
		}
		
		// //add space for breadcrumbs in case user drills down 
		// // - disabled as YF seems to include in the containing div but doesn't account for it in sizing calculations
		// // - awaiting comment from YF
		// // - 27 Feb 18: Confirmed that it will need a fix on YF end - affects drill down reports
		// options.height -= 30;

		//add space for yf footer
		options.height -= 5;

		//leave space for filter button
		options.height -= 30;

		//apply any options passed
		if (userOpts) {
			for (key in userOpts) {
				options[key] = userOpts[key];
			}
		}

		if (Object.keys(filtersSelected).length > 0){
			options.filters = filtersSelected;
		}

		//Publish filters for linking
		if (filterArr && !(userOpts && userOpts.triggerComp && userOpts.triggerComp == FSBL.Clients.WindowClient.options.name)){
			for (let i = 0; i < filterArr.length; i++) {
				if (filtersSelected[filterArr[i].filterUUID]) {
					FSBL.Clients.LinkerClient.publish({dataType: filterArr[i].description, data: {triggerComp: FSBL.Clients.WindowClient.options.name, filterValue: filtersSelected[filtersArr[i].filterUUID]}});
				}
			}
		}

		console.log("yellowfin options: " + JSON.stringify(options))
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

		setState();
	};

	let filtersSetup = false;
	function filterCallback(filters) {
		if (filters && filters.length) { 
			console.log("Num filters: " + filters.length)
			filterArr = filters;
			if(!filtersSetup) {
				for (let i = 0; i < filters.length; i++) {
					let filt = filters[i];

					//subscribe to filters
					FSBL.Clients.LinkerClient.subscribe(filt.description, function (obj) {
						console.log('Received filter data: ' + filt.description + " = " + JSON.stringify(obj));
						
						//ignore messages from ourselves
						if (obj && !(obj.triggerComp && obj.triggerComp == FSBL.Clients.WindowClient.options.name)) {
							filtersSelected[filt.filterUUID] = obj.filterValue;
							FSBL.Clients.RouterClient.transmit(FSBL.Clients.WindowClient.options.name, filtersSelected);					
							//update filter panel
							injectReport(reportUUID, elementId, {triggerComp: triggerComp});
						}
					});
				}
			}
			filtersSetup = true;
			//Listen to instructions from the filter panel
			FSBL.Clients.RouterClient.addListener(FSBL.Clients.WindowClient.options.name + ".filter", function (err, response) {
				if (err) return;
				filtersSelected = response.data;
				injectReport(reportUUID, elementId);
			});

		} else {
			console.log("filterCallback: No filters returned!");
		}
	}
	 
	function showFilterPanel() {
		// A windowIdentifier describes a component window. We create a unique windowName by using our current window's name and appending.
		// showWindow() will show this windowName if it's found. If not, then it will launch a new accountDetail coponent, and give it this name.
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
				console.log("Filter showWindow error: ", response);
			}
		);
	}


	let yfLoaded = false;
	let yfReportsLoaded = false;
	let checkLoaded = function() {
		if(yfLoaded && yfReportsLoaded) {
			injectReport(reportUUID, elementId);

			//load any filters
			window.yellowfin.reports.loadReportFilters(reportUUID, filterCallback);

			//reinject the report on window resize
			window.onresize = function() { 
				//only regenerate report when done resizing, 200 ms should be plenty, but may be able to shave lower
				clearTimeout(resizeId);
				resizeId = setTimeout(function() { injectReport(reportUUID, elementId); }, 200);
				//load any filters
				window.yellowfin.reports.loadReportFilters(reportUUID, filterCallback);
			};

			//setup the filter button
			$("#filterButton").click(function () {
				console.log("filter clicked");
				showFilterPanel();
			});

			//setup the reset button
			$("#resetButton").click(function () {
				console.log("reset clicked");
				filtersSelected = {};
				FSBL.Clients.RouterClient.transmit(FSBL.Clients.WindowClient.options.name, filtersSelected);
				injectReport(reportUUID, elementId);
			});
		}
	}

	//get a login token
	let loginToken = null;
	let yellowfinScr = document.createElement('script');
	let yellowfinReportScr = document.createElement('script');
	
	//retrieve and inject report HTML when API loaded (wait on last script added to DOM)
	yellowfinScr.onload = function () {
		yfLoaded = true;
		checkLoaded();
	};
	yellowfinReportScr.onload = function () {
		yfReportsLoaded = true;
		checkLoaded();
	};

	getLoginToken(function(err, token) {
		if (err) {
			Logger.error("Failed to retreive login token from webservice!");
		} else {
			Logger.log("Retrieved login token: " + token);
			loginToken = token;
		}
		
		//Setup YellowFin API script paths
		let yellowfinScrSrc = serverDetails.yellowfinProtocol + serverDetails.yellowfinHost + ":" + serverDetails.yellowfinPort + serverDetails.yellowfinPath;
		if (loginToken) {
			yellowfinScrSrc += `?reportUUID=${reportUUID}&token=${loginToken}`;
		}
		Logger.info("yellowfinScrSrc: " + yellowfinScrSrc)
		yellowfinScr.setAttribute('src', yellowfinScrSrc);
		yellowfinScr.setAttribute('type','text/javascript');
		document.body.appendChild(yellowfinScr);
		
		let yellowfinReportScrSrc = serverDetails.yellowfinProtocol + serverDetails.yellowfinHost + ":" + serverDetails.yellowfinPort + serverDetails.yellowfinReportPath;
		Logger.info("yellowfinReportScrSrc: " + yellowfinReportScrSrc)
		yellowfinReportScr.setAttribute('src', yellowfinReportScrSrc);
		yellowfinReportScr.setAttribute('type','text/javascript');

		document.body.appendChild(yellowfinReportScr);
	});

});