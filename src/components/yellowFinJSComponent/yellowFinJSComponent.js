
FSBL.addEventListener('onReady', function () {
	var yellowfin2Client = require('../../clients/yellowfin2Client');
	console.log("yellowfin2Client: " + yellowfin2Client);
	//host config - to move elsewhere
	var yellowfinProtocol = "http://";
	var yellowfinHost = "localhost";
	var yellowfinPort = "8081";
	var yellowfinPath = "/JsAPI"
	var yellowfinReportPath = "/JsAPI?api=reports"

	//report identifier
	var reportUUID = '32384c5a-7892-4ecb-93be-dc1efbdb7edd';	

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
		options.showFilters = 'true';
		options.showSeries = 'true';
		options.display = 'chart';
		options.fitTableWidth = 'true';
		options.showTitle = 'false';

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

		//apply any options passed
		if (userOpts) {
			for (key in userOpts) {
				options[key] = userOpts[key];
			}
		}

		console.log("yellowfin options: " + JSON.stringify(options))
		window.yellowfin.loadReport(options);

		//Window title hack - discussing adding a callback to YF JS API so we know when report is loaded AND to receive report metadata
		var setTitle = function() {
			if ($('div.yfReportTitle').length > 0){
				FSBL.Clients.WindowClient.setWindowTitle($('div.yfReportTitle').text());
			} else {
				setTimeout(setTitle, 300);
			}
		};
		//only enable if the title actually exists!
		if (options.showTitle === 'true'){
			setTimeout(setTitle, 300);
		}
	};

	function filterCallback(filters) {
		console.log("Num filters: " + filters.length)
		for (var i = 0; i < filters.length; i++) {
		   console.log('Filter ' + filters[i].description + ' (' +
			  filters[i].filterUUID + '), display style: ' +
			  filters[i].display);



		}
	 }

	//retrieve and inject report HTML when API loaded (wait on last script added to DOM)
	yellowfinReportScr.onload = function () {
		injectReport(reportUUID, elementId)

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
	};

	document.body.appendChild(yellowfinScr);
	document.body.appendChild(yellowfinReportScr);
});