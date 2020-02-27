/**
 * Function to add Finsemble integration using a passed in chart object.
 * 
 * @param stx The ChartEngine instance.
 */
module.exports = (stx) => {
	FSBL.Clients.Logger.debug("Starting chart integration");
	// #region Emitters
	const symbolEmitter = () => {
		const symbol = stx.chart.symbol;

		return {
			"symbol": symbol,
			"description": `Symbol ${symbol}`
		};
	};

	const chartEmitter = () => {
		const symbol = stx.chart.symbol;

		// TODO: Should there be a get chart state function?
		const chart = {
			symbol: symbol,
			layout: stx.exportLayout(true),
			drawings: stx.serializeDrawings()
		};

		return {
			chart: chart,
			description: `ChartIQ Chart For ${symbol}`
		};
	}

	const setEmitters = () => {
		FSBL.Clients.Logger.debug("Setting drag and drop emitters");
		FSBL.Clients.DragAndDropClient.setEmitters({
			emitters: [
				{
					type: "symbol",
					data: symbolEmitter
				},
				{
					type: "chartiq.chart",
					data: chartEmitter
				}
			]
		});
	}
	// #endregion

	// #region Receivers
	const symbolReceiverHandler = (err, response) => {
		FSBL.Clients.Logger.debug("Symbol received");
		if (err) {
			return FSBL.Clients.Logger.error("Error with drag and drop symbol receiver:", err);
		}

		const symbol = response.data["symbol"].symbol;
		const state = {
			symbol: symbol
		}

		updateFromState(state);
	};

	const chartReceiverHandler = (err, response) => {
		FSBL.Clients.Logger.debug("Chart received");
		if (err) {
			return FSBL.Clients.Logger.error("Error with drag and drop chart receiver:", err);
		}

		const state = response.data["chartiq.chart"].chart;
		updateFromState(state);
	};

	const addReceivers = () => {
		FSBL.Clients.Logger.debug("Adding drag and drop receivers");
		FSBL.Clients.DragAndDropClient.addReceivers({
			receivers: [
				{
					type: "symbol",
					handler: symbolReceiverHandler
				},
				{
					type: "chartiq.chart",
					handler: chartReceiverHandler
				}
			]
		});
	};
	// #endregion

	// #region Linker
	const subscribeLinker = () => {
		FSBL.Clients.Logger.debug("Subscribing to symbol linker");
		FSBL.Clients.LinkerClient.subscribe("symbol", (symbol, response) => {
			if (response.originatedHere()) {
				return;
			}

			if (stx.chart.symbol !== symbol) {
				const state = {
					symbol: symbol
				};
				
				updateFromState(state);
			}
		});
	};

	const publishSymbol = () => {
		const symbol = stx.chart.symbol;

		FSBL.Clients.Logger.debug(`Publishing symbol: ${symbol}`);
		const params = { dataType: "symbol", data: symbol };
		FSBL.Clients.LinkerClient.publish(params);
	};
	// #endregion

	// #region State
	const saveState = () => {
		FSBL.Clients.Logger.debug("Saving state");
		const symbol = stx.chart.symbol;
		const layout = stx.exportLayout(true);
		const drawings = stx.exportDrawings();

		// TODO: Is this necessary? Can we save the drawings object directly?
		const drawingsStr = drawings.length === 0 ? null : JSON.stringify(drawings);

		const params = {
			fields: [
				{
					field: "symbol",
					value: symbol
				},
				{
					field: "layout",
					value: layout
				},
				{
					field: "drawings",
					value: drawingsStr
				}
			]
		}

		FSBL.Clients.WindowClient.setComponentState(params);
	};

	const updateFromState = (state) => {
		FSBL.Clients.Logger.debug("Updating from state");
		if (!state) {
			// Make sure state isn't undefined
			state = {};
		}

		// Default values for anything not retrieved from storage or passed in
		if (!state.symbol) {
			state.symbol = "AAPL";
		}

		stx.newChart(
			state.symbol,
			null,
			null,
			() => {
				FSBL.Clients.WindowClient.setWindowTitle(state.symbol);

				if (state.layout) {
					stx.importLayout(state.layout);
				}

				if (state.drawings) {
					stx.importDrawings(state.drawings);
				}

				// Force study to redraw. For more information see: 
				// https://documentation.chartiq.com/WebComponents.cq-study-legend.html#main
				document.querySelector("cq-study-legend").begin()

				// Show on restore state, if hidden until state is ready
				FSBL.Clients.WindowClient.getCurrentWindow().show();
			});
	}

	const componentStateHandler = (err, state) => {
		FSBL.Clients.Logger.debug("Component state received");
		if (err) {
			return FSBL.Clients.Logger.error("Error fetching component state:", err);
		}

		if (!state) {
			state = {};
		}

		const opts = FSBL.Clients.WindowClient.options;

		// Data passed in from an opener will override the saved state
		if (opts.customData && opts.customData.spawnData) {
			const spawnData = opts.customData.spawnData;

			if (spawnData.symbol) {
				state.symbol = spawnData.symbol;
			}

			if (spawnData.layout) {
				state.layout = spawnData.layout;
			}

			// Ensure spawnData doesn't overwrite what's in storage the next time the app is loaded.
			FSBL.Clients.WindowClient.options.customData.spawnData = undefined;
		}

		updateFromState(state);
	};

	const restoreState = () => {
		FSBL.Clients.Logger.debug("Restoring component state");

		const params = {
			fields: [
				"symbol",
				"layout",
				"drawings"
			]
		};

		// TODO: Change to await so show can be after restore
		FSBL.Clients.WindowClient.getComponentState(params, componentStateHandler);
	};
	// #endregion

	const symbolChanged = () => {
		const symbol = stx.chart.symbol;
		FSBL.Clients.Logger.debug(`Symbol changed: ${symbol}`);
		FSBL.Clients.WindowClient.setWindowTitle(symbol);

		saveState();

		publishSymbol();
	};

	const initHandlers = () => {
		FSBL.Clients.Logger.debug("Initializing handlers");
		stx.callbacks.layout = saveState;
		stx.callbacks.symbolChange = symbolChanged;
		stx.callbacks.drawing = saveState;

		// Disable localStorage read/write by chart by replacing functions with no ops.
		CIQ.localStorage.getItem = () => { };
		CIQ.localStorage.removeItem = () => { };
		CIQ.localStorage.setItem = () => { };

		// If the chart is narrow enough that the gear appears for "More", when you click on the gear the sidenav covers 
		// the gear. The below CSS modification takes the top position of the side nav (45px) and pushes it down by the 
		// height of fsbl-header (25px) so the final top position of the sidenav is 75px. 
		// TODO: Update the chart CSS so this isn't	necessary.
		$(".ciq-sidenav").click(() => {
			$(".break-sm .sidenav").css("top", "75px");
		});

		// When resizing, reset the top for the toggles so they show up correctly.
		$(window).resize(() => {
			$("div.icon-toggles.ciq-toggles").css("top", "0px");
		});

		// When the charts in Finsemble get smaller than 585px wide, scrollbars appear. Scrollbars aren't needed/desired, so
		// so hide them.
		$("body").css("overflow", "hidden");
	};

	FSBL.Clients.Logger.debug("Starting Finsemble integration");
	FSBL.Clients.WindowClient.setWindowTitle(stx.chart.symbol);

	try {
		initHandlers();
		setEmitters();
		addReceivers();
		subscribeLinker();
		restoreState();
	} catch (err) {
		FSBL.Clients.Logger.error("Component initialization failed: ", err);
	}
}