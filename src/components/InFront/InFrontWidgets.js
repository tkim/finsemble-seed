

export function inFrontInit(widgetInitFunctions) {
	let infront = new Infront.UI({
		"user_id": "chartiq",
		"password": "p0o9i8",
		"streaming": true,
		"enableLoginDialog": false,
		"store_session": false,
		"useDefaultStateStorage": true,
		"routingUrl": "https://mws1.infrontservices.com/mws"
	});

	let widgetInitFns = function() {
		if (Array.isArray(widgetInitFunctions)) {
			for	(let f=0; f<widgetInitFunctions.length; f++){
				widgetInitFunctions[f](infront);
			}
		} else if (typeof widgetInitFunctions == "function") {
			widgetInitFunctions(infront);
		}
	}

	infront.registerEventObserver("onReady", widgetInitFns);

	infront.registerEventObserver("onDisconnect", function (event) {
		document.querySelector("#message").innerHTML = "Disconnected";
	});

	infront.registerEventObserver("onLoginFailed", function (event) {
		document.querySelector("#message").innerHTML = event.message;
	});

	infront.init();

	return infront;
}

//Functions to initialise the InFront Widgets
export function myListsWidget(infront) {
	var myopts = new Infront.MyListsWidgetOptions();
	myopts.sortable = true;
	myopts.defaultSortedColumn = 0;
	myopts.defaultSortOrder = Infront.SortOrder.Desc;
	myopts.columns = ["FULL_NAME", "CURRENCY", "LAST", "PCT_CHANGE", "S_DATETIME"];
	infront.myListsWidget("#my-list", myopts);
}

//Functions to initialise the InFront Widgets
export function orderbookWidget(infront) {
	let opts = new Infront.OrderbookWidgetOptions();
	opts.instrument = {"feed":26, "ticker":"BMW"};
	opts.levels = 10;
	opts.layout = Infront.OrderbookRowLayout.COMPACT;
	opts.onPriceInstrumentClick = function (price, type, instrument) {
		console.log(instrument.ticker, "Price:", price, "Type:", type);
	};
	opts.tickerInHeader = true;
	opts.onPriceClick = function (price, type) {
		console.log("Price:", price, "Type:", type);
	};
	opts.onTickerClick = function (instrument) {
		console.log(instrument);
	};
   
	infront.orderbookWidget("#orderbook1", opts);
}

//Functions to initialise the InFront Widgets
export function indexWidget(infront) {
	let iopts = new Infront.IndexOverviewWidgetOptions();
	iopts.instrument = new Infront.Instrument(2098, "DAX");
	iopts.primaryValue = "LAST";
	infront.indexOverviewWidget("#index", iopts);
}

//Functions to initialise the InFront Widgets
export function focusWidget(infront) {
	let fopts = new Infront.FocusWidgetOptions();
	fopts.instrument = new Infront.Instrument(2008, "UG");
	infront.focusWidget("#focus", fopts);
}





