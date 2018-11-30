export function inFrontInit(widgetInitFunctions, widgetSelectors) {
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
			if (widgetInitFunctions.length !== widgetSelectors.length) {
				FSBL.Clients.Logger.error(`One selector should be passed for each widget to be initialized, num widgets: ${widgetInitFunctions.length}, num selectors: ${widgetSelectors.length}`);
			}
			for	(let f=0; f<widgetInitFunctions.length; f++){
				widgetInitFunctions[f](infront, widgetSelectors[f]);
			}
		} else if (typeof widgetInitFunctions == "function") {
			let selector = Array.isArray(widgetSelectors) ? widgetSelectors[0] : widgetSelectors;
			widgetInitFunctions(infront, selector);
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


//---------------------------------------------------------------
// Market data widgets 
//---------------------------------------------------------------

/** 
 * Creates a window to add or modify alerts.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#AlertWidget
 */
export function alertWidget(infront, elementSelector) {
    var opts = new Infront.AlertWidgetOptions();
	infront.alertWidget(elementSelector, opts);
}

/** 
 * This widgets shows a list of all the alerts you currently have in our system.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#AlertListWidget
 */
export function alertListWidget(infront, elementSelector) {
    var opts = new Infront.AlertListWidgetOptions();
	infront.alertListWidget(elementSelector, opts);
}

/** 
 * Shows a table of broker statistics for a feed, an instrument or a specific broker.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#BrokerstatsWidget
 */
export function brokerstatsWidget(infront, elementSelector) {
	var opts = new Infront.BrokerstatsWidgetOptions();
	opts.instrument = new Infront.Instrument(100, "NOKIA");
	opts.columns = ["NAME", "FULLNAME", "BUY_VALUE", "SELL_VALUE", "TOTAL_VALUE"];
	opts.period = InfrontConstants.BrokerStatsPeriodes.INTRADAY;
	opts.sortable = true;
	opts.defaultSortedColumn = 4;
	opts.enablePeriodSelector = true;

	infront.brokerstatsWidget(elementSelector, opts);
}

/** 
 * The chart widget enables users to see symbols performance over time, 
 * compare it to other symbols, and display powerful graphical indicators. 
 * Close price development can bee seen as "line" or "area" type charts, 
 * and OHLC values can be visualiced as "Candlestick" or "Bar" charts.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#ChartWidget
 */
export function chartWidget(infront, elementSelector) {
	var chartOpts = new Infront.ChartWidgetOptions2();
	chartOpts.defaultPeriod = "5D";
	chartOpts.instruments = [new Infront.Instrument(18177,"STL")];
	chartOpts.showVolume = true;
	chartOpts.zoom = true;
	chartOpts.streaming = true;
	chartOpts.chartUI = {
		tooltipVersion: "advanced",
		periodMenu: true,
		indicatorMenu: true,
		chartTypeMenu: true,
		searchBox: true
	};
	
	infront.chartWidget2(elementSelector, chartOpts);
}

/** 
 * This widget shows a financial calendar for a given country/feed/instrument (or a set of).
 * @see https://doc.infrontfinance.com/MarketDataWidgets#FinancialCalendarWidget
 */
export function financialCalendarWidget(infront, elementSelector) {
	/* This configuration shows a financial calendar for Great Britain for the next 6 months.
	* Includes paging with 10 items pr page and expanded layout.
	*/
	var opts = new Infront.FinancialCalendarWidgetOptions();
	opts.countryCodes = ["GB"];
	opts.endDate = InfrontUtil.addMonths(new Date(), 6);
	opts.paging = true;
	opts.layout = Infront.FinancialCalendarLayout.EXPANDED;
	infront.financialCalendarWidget(elementSelector, opts);
}

/** 
 * The focus window gives the user a quick overview of one specific instrument.
 * 
 * The bottom row is a change indicator that displays the current trend based on 
 * last price. The right part of the window consists of a range panel, with values 
 * in both ends displaying today's high and low. An arrow indicates where the price 
 * is with respect to high/low.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#FocusWidget
 */
export function focusWidget(infront, elementSelector) {
	var opts = new Infront.FocusWidgetOptions();
	opts.instrument = new Infront.Instrument(2008, "UG");
	infront.focusWidget(elementSelector, opts);
}

/** 
 * The fund allocation widget gives the user a list of a funds top county, asset or sector allocation.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#FundAllocationWidget
 */
export function fundAllocationWidget(infront, elementSelector) {
	var opts = new Infront.FundAllocationWidgetOptions();
	opts.instrument = new Infront.Instrument(17935, "0P00000AO2");
	infront.fundAllocationWidget(elementSelector, opts);
}

/** 
 * The fund allocation pie chart widget gives the user a graphical representation of the 
 * county, asset or sector allocation of one or more funds. If more than one allocation 
 * weighes less than 2%, they will be grouped as "others".
 * @see https://doc.infrontfinance.com/MarketDataWidgets#FundAllocationPieChartWidget
 */
export function fundAllocationPieChartWidget(infront, elementSelector) {
	var fundPieOpts = new Infront.FundAllocationPieChartWidgetOptions();
	fundPieOpts.instruments = [new Infront.Instrument(18197, "0P00009FQ5"), new Infront.Instrument(2260, "0P00009FQA")];
	fundPieOpts.allocationType = "Country";
	fundPieOpts.innerSize = "33%";
	fundPieOpts.legend = true;
	infront.fundAllocationPieChartWidget(elementSelector, fundPieOpts);
}

/** 
 * The morningstar widget shows the morningstar rating for a fund.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#FundMorningstarWidget
 */
export function fundMorningstarRatingWidget(infront, elementSelector) {
	var opts = new Infront.FundMorningstarRatingWidgetOptions();
	opts.instrument = new Infront.Instrument(17935, "0P00000AO2");
	infront.fundMorningstarRatingWidget(elementSelector, opts);
}

/** 
 * The risk level widget shows the risk rating of a fund.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#FundRiskLevelWidget
 */
export function fundRiskLevelWidget(infront, elementSelector) {
	var opts = new Infront.FundRiskLevelWidgetOptions();
	opts.instrument = new Infront.Instrument(17935, "0P00000AO2");
	infront.fundRiskLevelWidget(elementSelector, opts);
}

/** 
 * The stylemap widget gives the user a stylemap grid for the fund.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#FundStylemapWidget
 */
export function fundStylemapWidget(infront, elementSelector) {
	var opts = new Infront.FundStylemapWidgetOptions();
	opts.instrument = new Infront.Instrument(17935, "0P00000AO2");
	infront.fundStylemapWidget(elementSelector, opts);
}

/** 
 * The fund top holdings widget shows a list of the top ten individual assets of the fund.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#FundTopHoldingsWidget
 */
export function fundTopHoldingsWidget(infront, elementSelector) {
	var opts = new Infront.FundTopHoldingsWidgetOptions();
	opts.instrument = new Infront.Instrument(17935, "0P00000AO2");
	infront.fundTopHoldingsWidget(elementSelector, opts);
}

/** 
 * Shows up to five configurable historical values, as well as a year high/low bar.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#HistoricalWidget
 */
export function historicalOverviewWidget(infront, elementSelector) {
	var opts = new Infront.HistoricalOverviewWidgetOptions();
	opts.instrument = new Infront.Instrument(2088, "SP500");
	opts.barPeriod = InfrontConstants.HistoricalPeriodes.ONE_WEEK;
	opts.historicFields = [
		InfrontConstants.HistoricalPeriodes.ONE_WEEK,
		InfrontConstants.HistoricalPeriodes.ONE_MONTH,
		InfrontConstants.HistoricalPeriodes.THREE_MONTH,
		InfrontConstants.HistoricalPeriodes.SIX_MONTH,
		InfrontConstants.HistoricalPeriodes.ONE_YEAR
	 ];
	infront.historicalOverviewWidget(elementSelector, opts);
}

/** 
 * Shows end of day prices for all days in a year. Includes dividends and splits.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#HistoryWidget
 */
export function historyWidget(infront, elementSelector) {
	var opts = new Infront.HistoryWidgetOptions();
    opts.instrument = new Infront.Instrument(2008, "UG");
    opts.widgetTitle = "Historical prices, Peugeot (Euronext Paris)";
    opts.startYear = 1999;
    opts.endYear = 2015;

    infront.historyWidget(elementSelector, opts);
}

/** 
 * This widget shows a compact overview of an index, showing last, percent change, 
 * nominal change, constituents performance and historical performance.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#IndexOverviewWidget
 */
export function indexOverviewWidget(infront, elementSelector) {
	var opts = new Infront.IndexOverviewWidgetOptions();
	opts.instrument = new Infront.Instrument(2098, "DAX");
	opts.primaryValue = "LAST";
	
	infront.indexOverviewWidget(elementSelector, opts);
}

/** 
 * Shows the latest trades of a given instrument.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#IntradayTradesWidget
 */
export function intradayTradesWidget(infront, elementSelector) {
	var opts = new Infront.IntradayTradesWidgetOptions();
	opts.instrument = new Infront.Instrument(100, "NRE1V")
	opts.pageItems = 20;
	opts.paging = false;
	opts.columns = [
	  {
		name: "TIME",
		className: "cell-text-left"
	  },
	  "VOLUME",
	  {
		name: "BUYER",
		className: "cell-text-center"
	  },
	  {
		name: "SELLER",
		className: "cell-text-center"
	  },
	  "LAST",
	];
	
	infront.intradayTradesWidget(elementSelector, opts);
}

/** 
 * Shows the latest trades of a given instrument.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#IntradayTradesMiniWidget
 */
export function intradayTradesMiniWidget(infront, elementSelector) {
	var opts = new Infront.IntradayTradesWidgetOptions();
	opts.instrument = { "feed": 2008, "ticker": "UG" };
	opts.pageItems = 10;
	opts.tickerInHeader = true;
	
	infront.intradayTradesWidget(elementSelector, opts);
}

/** 
 * Shows an array of fields for a given instrument.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#MultipleValuesWidget
 */
export function instrumentValuesWidget(infront, elementSelector) {
	var opts = new Infront.InstrumentValuesWidgetOptions();
	opts.widgetTitle = "DNB Private Equity retail B";
	opts.instrument = new Infront.Instrument(18197, "0P00009FQ5");
	opts.layout = Infront.MultipleValuesWidgetLayout.VERTICAL;
	opts.paging = false;
	opts.fields = ["CURRENCY", "SEGMENT", "START_DATE"];
	
	infront.instrumentValuesWidget(elementSelector, opts);
}

/** 
 * The My lists widget displays a range a of customised lists across one or more tables (tabbed). The lists are made and maintained by the user.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#MyListsWidget
 */
export function myListsWidget(infront, elementSelector) {
	var myopts = new Infront.MyListsWidgetOptions();
	myopts.sortable = true;
	myopts.defaultSortedColumn = 3;
	myopts.defaultSortOrder = Infront.SortOrder.Desc;
	myopts.columns = ["TICKER", "FULL_NAME", "CURRENCY", "LAST", "PCT_CHANGE", "S_DATETIME"];
	myopts.tabs = [{
        id:"overview",
        label:"Overview",
        columns:["TICKER", "CURRENCY", "LAST"]
    },{
        id: "performance",
        label: "Performance",
        columns: ["TICKER", "YTD_CHANGE", "PCT_CHANGE"]
    }];
	infront.myListsWidget(elementSelector, myopts);
}

/** 
 * This widget shows a list of news-headlines with source and time/date from one or more 
 * news-feeds.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#NewsWidget
 */
export function newsListWidget(infront, elementSelector) {
	var opts = new Infront.NewsListWidgetOptions();
	opts.columns = ["TIME", "HEADLINE","SHORT_SOURCE"];
	opts.preSelectedRegions = ["FRANCE"];
	opts.streaming = true;
	opts.paging = true;
	opts.pageItems = 12;
	infront.newsListWidget(elementSelector, opts);
}

/** 
 * This simple widget works as a slave to the NewsListWidget and is usually instantiated 
 * automatically by it. If you wish to, you can do it yourself by instantiating and 
 * linking the widgets manually. This can be used to, for example, place the list and 
 * the reader side by side.
 * 
 * Requires a set height on the parent container.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#NewsReaderWidget
 */
export function newsReaderWidget(infront, elementSelector) {
	var opts = new Infront.NewsListWidgetOptions();
    opts.maxItems = 10;
    opts.useLightbox = false;
    var newsListWidget = infront.newsListWidget("newslist", opts);
    var newsReaderWidget = infront.newsReaderWidget(elementSelector);
    newsListWidget.link(newsReaderWidget);
}

/** 
 * The Orderbook shows an overview of the current orders for an instrument. 
 * The columns are configurable.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#OrderbookWidget
 */
export function orderbookWidget(infront, elementSelector) {
	// var opts = new Infront.OrderbookWidgetOptions();
	// opts.instrument = {"feed":2008, "ticker":"UG"};
	// opts.levels = 1;
	// opts.layout = Infront.OrderbookRowLayout.COMPACT;
	
	// infront.orderbookWidget("#orderbook1", opts);

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
   
	infront.orderbookWidget(elementSelector, opts);
}

/** 
 * A generic and highly configurable market data table.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#QuoteListWidget
 */
export function quoteListWidget(infront, elementSelector) {
	/* 
	*  This is the table layout version of the quotelist
	*/
	var opts = new Infront.QuoteListWidgetOptions();
	opts.instruments = [
		new Infront.Instrument(6880, "990100P"),
		new Infront.Instrument(20, "DJI"),
		new Infront.Instrument(2087, "COMP"),
		new Infront.Instrument(2088, "SP500"),
		new Infront.Instrument(2018, "UKX")
	];
	opts.columns = ["FULL_NAME", "CURRENCY", "LAST"];
	infront.quoteList("#quotelist", opts);

	/* 
	*  This is the flex layout version of the quotelist
	*/
	var optsflex = new Infront.QuoteListWidgetOptions();
	optsflex.instruments = opts.instruments;
	optsflex.layout = Infront.ListLayout.DIV;
	optsflex.expandableRows = true;
	optsflex.createExpandRow = function (instrument, element) {
		var container = document.createElement("div");
		container.setAttribute("style", "width:100%;height:200px");
		element.appendChild(container);
		var opts = new Infront.FocusWidgetOptions();
		opts.instrument = instrument;
		var focus = infront.focusWidget(container, opts);
	
		return function () {
			/* If you are using widgets while handling incomplete data
			*  it is recommended that you use try catch functions. 
			*  ALWAYS call destroy methods of widgets used in createExpandRow
			*/
				try {
					focus.destroy();
				}
				catch (error) {
					console.log(error);
				}
			/* end return function by removing the container */
			container.parentElement.removeChild(container);
		}; 
	}
	infront.quoteList(elementSelector, optsflex);
}

/** 
 * Displays a configurable ranked list for a given feed and period.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#RankingWidget
 */
export function rankingWidget(infront, elementSelector) {
	/* Shows losers (Infront.SortOrder.Asc) for Nasdaq OMX Copenhagen (17665)
	* 10 rows with period selector, only stocks
	*/
	var opts = new Infront.RankingWidgetOptions();
	opts.feed = 17665;
	opts.sortOrder = Infront.SortOrder.Asc;
	opts.rows = 10;
	opts.rankingPeriod = Infront.RankingPeriod.ONE_WEEK;
	opts.enablePeriodSelector = true;
	opts.instrumentTypes = ["STOCK"];
	infront.rankingWidget(elementSelector, opts);
}

/** 
 * A widget that filters symbols and displays the number of symbols within a filter that is selected.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#ScreenerWidget
 */
export function screenerWidget(infront, elementSelector) {
	var opts = new Infront.ScreenerWidgetOptions();
	opts.feed = 18197;
	opts.linkChannels = [4555];
	opts.linkAction = Infront.LinkAction.Append;
	opts.title = "Filters";
	opts.collapsable = true;
	opts.filters = [
		{
			defaultExpanded: true,
			filterFields: "STAR_RATING",
			header: "Morningstar Rating",
			filterItems: [
				new Infront.FilterItem("Not Rated", (val) => {
				return typeof val == "undefined" || val == 0;
				}),
				new Infront.FilterItem("★", (val) => { return val == 1; }, "star-param-1"),
				new Infront.FilterItem("★★", (val) => { return val == 2; }, "star-param-2"),
				new Infront.FilterItem("★★★", (val) => { return val == 3; }, "star-param-3"),
				new Infront.FilterItem("★★★★", (val) => { return val == 4; }, "star-param-4"),
				new Infront.FilterItem("★★★★★", (val) => { return val == 5; }, "star-param-5"),
			]
		},
		{
			filterFields: ["FULL_NAME", "RISK_LEVEL"],
			//header: "Name containing:",
			placeholder: "Enter text here",
			filterType: Infront.FilterTypeEnum.FreeText,
			className: "free-text-filter2",
			filterItems: [new Infront.FilterItemValue("★★★", [3], "free-text-val")]
		},
		{
			filterFields: "STAR_RATING",
			header: "Morningstar Rating",
			filterType: Infront.FilterTypeEnum.Select,
			className: "star-select-group",
			filterItems: [ new Infront.FilterItemValue("★★★", [3], "star-select-val")]
		},
		Infront.FilterEnum.Risklevel,
	];
	opts.searchBox = {
		filterField: ["FULL_NAME", "RISK_LEVEL"],
		header: "NAME CONTAINING",
		placeholder: "Search here"
	};
	
	var quotelist;
	var qopts = new Infront.QuoteListWidgetOptions();
	qopts.linkChannels = [4555];
	qopts.linkAction = Infront.LinkAction.Append;
	qopts.sortable = true;
	qopts.maxItems = 5;
	
	/* this function tracks total number of items in the list */  
	qopts.onItemCountChange = function (num) {
		console.log(num);
	};
	qopts.columns = [
		"FULL_NAME",
		{
		"name": "Tips",
		"type": "custom",
		"heading": "Tips",
		"content": "BUY",
		},
		"RISK_LEVEL",
		"STAR_RATING"
	];
	quoteList = infront.quoteList("quotelist", qopts);
	infront.ScreenerWidget(elementSelector, opts);
}

/** 
 * A widget that filters symbols and displays the number of symbols within a filter that is selected.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#ScreenerActiveFiltersWidget
 */
export function screenerActiveFiltersWidget(infront, elementSelector) {
	var opts = new Infront.ScreenerWidgetOptions();
	opts.feed = 18197;
	opts.linkChannels = [4555];
	opts.linkAction = Infront.LinkAction.Append;
	opts.title = "Filters";
	opts.collapsable = true;
	opts.filters = [
		{
			defaultExpanded: true,
			filterField: "STAR_RATING",
			header: "Morningstar Rating",
			filterItems: [
				new Infront.FilterItem("Not Rated", (val) => {
					return typeof val == "undefined" || val == 0;
				}),
				new Infront.FilterItem("★", (val) => { return val == 1; }),
				new Infront.FilterItem("★★", (val) => { return val == 2; }),
				new Infront.FilterItem("★★★", (val) => { return val == 3; }),
				new Infront.FilterItem("★★★★", (val) => { return val == 4; }),
				new Infront.FilterItem("★★★★★", (val) => { return val == 5; }),
			]
		},
			Infront.FundFilterEnum.Risklevel,
	];
	opts.searchBox = {
		filterField: ["FULL_NAME", "RISK_LEVEL"],
		header: "NAME CONTAINING",
		placeholder: "Search here"
	};
	
	var activeOpts = new Infront.ScreenerActiveFiltersWidgetOptions();
	activeOpts.linkChannels = [4555];
	activeOpts.linkAction = Infront.LinkAction.Append;
	infront.activeFiltersWidget("activeFilters", activeOpts);
	infront.ScreenerWidget(elementSelector, opts);
}

/** 
 * A widget that shows a two-day chart with both the last value and the percent change.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#SimpleChartOverviewWidget
 */
export function simpleChartOverviewWidget(infront, elementSelector) {
	var opts = new Infront.SimpleChartOverviewWidgetOptions();
	opts.instrument = new Infront.Instrument(2008, "UG");
	infront.simpleChartOverviewWidget(elementSelector, opts);
}

/** 
 * A widget showing a pair of values divided by a vertical line.
 * @see https://doc.infrontfinance.com/MarketDataWidgets#ValuePairWidget
 */
export function valuePairWidget(infront, elementSelector) {
	var opts = new Infront.ValuePairWidgetOptions();
	opts.instrument = new Infront.Instrument(12, "EURUSD");
	opts.leftField = "HIGH";
	opts.rightField = "LOW";
	infront.valuePairWidget(elementSelector, opts);
}