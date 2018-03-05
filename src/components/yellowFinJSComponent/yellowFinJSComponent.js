//host config - to move elsewhere
var yellowfinProtocol = "http://";
var yellowfinHost = "localhost";
var yellowfinPort = "8081";
var yellowfinPath = "/JsAPI"
var yellowfinReportPath = "/JsAPI?api=reports"

//JQuery
var $ = require("jquery");

//state
var filtersSelected = {};
var filterArr = [];
var reportUUID = null;


/**
 * Sets the state of a component to the Workspace
 */
function setState() {

	var state = {"filtersSelected": filtersSelected,
				"filterArr": filterArr,
				"reportUUID": reportUUID};
	FSBL.Clients.WindowClient.setComponentState({ field: 'reportState', value: state });
}

/**
 * Gets the the stored state of a component
 */
function getState() {
	FSBL.Clients.WindowClient.getComponentState({
		field: 'reportState',
	}, function (err, state) {
		if (state === null) {
			return;
		}

		filtersSelected = state.filtersSelected;
		filterArr = state.filterArr;
		reportUUID = state.reportUUID;
	});
}


var myWindowIdentifier;

FSBL.addEventListener('onReady', function () {
	reportUUID = '32384c5a-7892-4ecb-93be-dc1efbdb7edd';	
	FSBL.Clients.WindowClient.getWindowIdentifier(function(id) {myWindowIdentifier = id;});

	getState();
	
	//get YellowFinCLient if we're using it
	var yellowfin2Client = require('../../clients/yellowfin2Client');
	console.log("yellowfin2Client: " + yellowfin2Client);
	
	//get spawing data to set report ID
	var spawnData = FSBL.Clients.WindowClient.getSpawnData();
	console.log("Spawn data: " + JSON.stringify(spawnData));
	if (spawnData){
		if (spawnData.reportUUID) { 
			reportUUID = spawnData.reportUUID;
			console.log("Set reportUUID: " + JSON.stringify(reportUUID)); 
		}
	}

	//load YellowFin API from host
	var yellowfinScr = document.createElement('script');
	yellowfinScr.setAttribute('src',yellowfinProtocol + yellowfinHost + ":" + yellowfinPort + yellowfinPath);
	yellowfinScr.setAttribute('type','text/javascript');
	
	var yellowfinReportScr = document.createElement('script');
	yellowfinReportScr.setAttribute('src',yellowfinProtocol + yellowfinHost + ":" + yellowfinPort + yellowfinReportPath);
	yellowfinReportScr.setAttribute('type','text/javascript');

	var userOpts = null;
	var resizeId;
	var elementId = 'yellowfinContainer';

	var injectReport = function(uuid, elementId, opts) {
		if (opts) {
			//disallow forcing width and height so that we respond to window size
			if (opts.width) { delete opts.width;}
			if (opts.height) { delete opts.height;}
			userOpts = opts;
		}
		var options = {};
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

		console.log("yellowfin options: " + JSON.stringify(options))
		window.yellowfin.loadReport(options);

		//Window title hack - discussing adding a callback to YF JS API so we know when report is loaded AND to receive report metadata
		var setTitle = function() {
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


	function filterCallback(filters) {
		if (filters && filters.length) { 
			console.log("Num filters: " + filters.length)
			filterArr = filters;
			for (var i = 0; i < filters.length; i++) {
				var filt = filters[i];


				//Rewrite this to support a full filter state with descriptions as well as UUIDs
				FSBL.Clients.LinkerClient.subscribe("filter:"+ filt.description, function (obj) {
					console.log('Received filter data: ' + filt.description + " = " + JSON.stringify(obj));

					// //clear other filters - for now we only support one at a time...				
					// var filterValues = {};
					// filterValues[filt.filterUUID] = obj;
					// options.filters = filterValues;
					injectReport(reportUUID, elementId);
				});
			}

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
		var windowIdentifier={
			componentType: "yellowFinFilterComponent",
			windowName: FSBL.Clients.WindowClient.options.name + ".filter"
		};
	
		FSBL.Clients.LauncherClient.showWindow(windowIdentifier,
			{
				position: "relative",
				addToWorkspace: true,
				right: "adjacent",
				top: 0,
				height: window.innerHeight,
				spawnIfNotFound: true,
				slave: true,
				relativeWindow: myWindowIdentifier,
				groupOnSpawn: true,
				data: {"reportUUID": reportUUID, "filtersSelected": filtersSelected}
			}, function(err, response){
				console.log("Filter showWindow error: ", response);
				//accountDetailSpawnResponse=response;
				// After the component is launched, or displayed, we tell the child which customer to use.
				//FSBL.Clients.RouterClient.transmit(windowIdentifier.windowName, customers[customerIndex]);
			}
		);
	}


	var yfLoaded = false;
	var yfReportsLoaded = false;
	var checkLoaded = function() {
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