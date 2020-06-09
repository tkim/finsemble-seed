//TODO: typescript
//TODO: create types to represent: connectionStatus/Event, worksheet and group data

/**
 * Client class for communicating with the Finsemble Bloomberg Bridge over the the Finsemble Router.
 */
export default class BloombergBridgeClient {
	connectionEventListener = null;
	groupEventListener = null;
	routerClient = null;
	logger = null;

	/**
	 * BloombergBridgeClient constructor.
	 * @param {IRouterClient} routerClient An instance of the Finsemble router client to be used for all communication.
	 */
	constructor(routerClient, logger) {
		this.routerClient = routerClient;
		this.logger = logger;
	}

	/**
	 * Set a handler function for connection events. 
	 * 
	 * Note that only one handler function is permitted, hence calling
	 * this multiple times will simply replace the existing handler.
	 * 
	 * @param {function} cb Node-style callback function (err, response)
	 */
	setConnectionEventListener (cb) {
		if (this.connectionEventListener) {
			removeConnectionEventListener();
		}
		console.log("Set new Listener for Bloomberg connection events...");
		this.connectionEventListener = (err, resp) => {
			console.log("Received connection event... Response: ", resp);
			if (err) {
				console.error("Received Bloomberg connection error: ", err);
			} else {
				console.log("Received Bloomberg connection event: ", resp);
			}
			cb(err, resp);
		};
		this.routerClient.addListener("BBG_connection_status", this.connectionEventListener);
	}

	/**
	 * Remove the current connection event handler.
	 */
	removeConnectionEventListener() {
		if (this.connectionEventListener) {
			this.routerClient.removeListener("BBG_connection_status", this.connectionEventListener);
			console.log("Removed connection event listener");
		} else {
			console.warn("Tried to remove non-existent connection event listener");
		}
	}

	/**
	 * Set a handler function for Launchpad group context changed events.
	 *
	 * Note that only one handler function is permitted, hence calling
	 * this multiple times will simply replace the existing handler.
	 * 
	 * @param {function} cb Node-style callback function (err, response)
	 */
	setGroupEventListener (cb) {
		if (this.groupEventListener) {
			removeGroupEventListener();
		}
		console.log("Set new listener for Bloomberg group context events...");
		this.groupEventListener = (err, resp) => {
			if (err) {
				console.error("Received Bloomberg group context error: ", err);
			} else {
				console.log("Received Bloomberg group context event: ", resp);
			}
			cb(err, resp);
		};
		this.routerClient.addListener("BBG_group_context_events", this.groupEventListener);
	}

	/**
	 * Remove the current group context changed event handler.
	 */
	removeGroupEventListener() {
		if (this.groupEventListener) {
			this.routerClient.removeListener("BBG_group_context_events", this.groupEventListener);
			console.log("Removed group context event listener");
		} else {
			console.warn("Tried to remove non-existent group context event listener");
		}
	};

	/**
	 * Check that Bloomberg bridge is connected to teh Bloomberg Terminal and that a user is logged in.
	 * @param {function} cb Node-style callback that is passed an error if we are not currently connected and
	 * logged in, or a response consisting of `true` if we are.
	 */
	checkConnection(cb) {
		console.log("Checking connection status...");

		this.routerClient.query("BBG_connection_status", {}, (err, resp) => {
			if (err) {
				console.warn("Received error when checking connection status: ", err);
				cb(err, false);
			} else {
				if (resp && resp.data && resp.data["loggedIn"]) {
					console.log("Received connection status: ", resp.data);
					cb(null, resp.data["loggedIn"]);
				} else {
					console.log("Received negative or empty response when checking connection status: ", resp);
					cb("Received negative or empty response when checking connection status", null);
				}

			}
		});
	}

	/**
	 * Internal function used to send a Query to the BBG_run_terminal_function responder of BloombergBridge,
	 * which implements the majority functions for the BloombergBridgeClient.
	 * @param {Object} message The query data to pass.
	 * @param {string} message.function Required field that determines which function to run. 
	 * @param {function} cb Node-style callback that will be passed the response from the Bloomberg Bridge.
	 */
	queryBloombergBridge(message, cb) {
		console.log("BBG_run_terminal_function query:", message);
		this.logger.log("BBG_run_terminal_function query:", message);
		this.routerClient.query("BBG_run_terminal_function", message, this.apiResponseHandler(cb));
	}

	/**
	 * Internal function used to return a call back that will wrap the supplied callback and log all responses
	 * from the Bloomberg Bridge to aid debugging.
	 * @param {function} cb Node-style callback to be wrapped.
	 */
	apiResponseHandler(cb) {
		return (err, resp) => {
			if (err) {
				let errMsg = "Error returned by BBG_run_terminal_function: ";
				console.error(errMsg, err);
				this.logger.error(errMsg, err);
				cb(err, resp);
			} else if (!resp || !resp.data || !resp.data.status) {
				let errMsg = "Negative status returned by BBG_run_terminal_function: ";
				console.error(errMsg, resp);
				this.logger.error(errMsg, resp);
				cb("Command returned negative status", resp);
			} else {
				let msg = "BBG_run_terminal_function successful, response: ";
				console.log(msg, resp.data);
				this.logger.log(msg, resp);
				cb(null, resp.data);
			}
		};
	}

	/**
	 * Run a function in one of the 4 Bloomberg panel windows.
	 * @param {string} mnemonic The mnemonic of the Bloomberg command to run on a panel
	 * @param {Array} securities (optional) An array of strings representing one or more securities 
	 * to pass to the function.
	 * @param {string} panel Panel number to run the command on (accepts values "1", "2", "3" or "4")
	 * @param {string} tails (optional) paramaters passed to the function
	 * @param {function} cb Node-style callback that will return an error on failure or a response 
	 * containing a positive status value on success.
	 */
	runBBGCommand(mnemonic, securities, panel, tails, cb) {
		let message = {
			function: "RunFunction",
			mnemonic: mnemonic,
			securities: securities,
			tails: tails,
			panel: panel
		};

		this.queryBloombergBridge(message, cb);
	}

	/**
	 * Create a new worksheet with the specified securities and name.
	 * @param {string} worksheetName Name for the worksheet.
	 * @param {Array} securities An array of strings representing one or more securities.
	 * @param {function} cb Node-style callback that will return an error on failure or a response 
	 * containing a positive status value and details of the created worksheet (with securities resolved
	 * and an id assigned) on success. 
	 */
	runCreateWorksheet(worksheetName, securities, cb) {
		let message = {
			function: "CreateWorksheet",
			name: worksheetName,
			securities: securities
		};

		this.queryBloombergBridge(message, cb);
	}

	/**
	 * Retrieve all worksheets for the user.
	 * @param {function} cb Node-style callback that will return an error on failure or a response
	 * containing a positive status value and a worksheets Array with details of all the user's worksheets.
	 */
	runGetAllWorksheets(cb) {
		let message = {
			function: "GetAllWorksheets"
		};

		this.queryBloombergBridge(message, cb);
	}

	/**
	 * Retrieve a specific worksheet by id.
	 * @param {string} worksheetId Worksheet ID to retrieve.
	 * @param {function} cb Node-style callback that will return an error on failure or a response
	 * containing a positive status value and a worksheet element with details of the retrieved worksheet.
	 */
	runGetWorksheet(worksheetId, cb) {
		let message = {
			function: "GetWorksheet",
			id: worksheetId
		};

		this.queryBloombergBridge(message, cb);
	}

	/**
	 * Replaces a specific worksheet by ID with a new list of securities.
	 * @param {string} worksheetId  Worksheet ID to replace.
	 * @param {Array} securities An array of strings representing one or more securities.
	 * @param {function} cb Node-style callback that will return an error on failure or a response
	 * containing a positive status value and a worksheet element with details of the updated worksheet.
	 */
	runReplaceWorksheet(worksheetId, securities, cb) {
		let message = {
			function: "ReplaceWorksheet",
			id: worksheetId,
			securities: securities
		};

		this.queryBloombergBridge(message, cb);
	}

	/**
	 * Gets a list of all available Launchpad component groups.
	 * @param {function} cb Node-style callback that will return an error on failure or a response
	 * containing a positive status value and a groups Array with details of all the user's component groups.
	 */
	runGetAllGroups(cb) {
		let message = {
			function: "GetAllGroups"
		};

		this.queryBloombergBridge(message, cb);
	};

	/**
	 * Returns details of a Launchpad component group by name.
	 * @param {string} groupName The name of the component group to retrieve.
	 * @param {function} cb Node-style callback that will return an error on failure or a response
	 * containing a positive status value and a group element with details of specified component group,
	 * e.g.
	 * 
	 */
	runGetGroupContext(groupName, cb) {
		let message = {
			function: "GetGroupContext",
			name: groupName
		};

		this.queryBloombergBridge(message, cb);
	}

	/**
	 * Set the context value of a Launchpad group by name. 
	 * @param {string} groupName The name of the component group to set the value of.
	 * @param {string} value The value to set for hte group, this will usually be a string presenting a security.
	 * @param {string} cookie (optional) Cookie value identifying a particual component within a group to set the context of.
	 * @param {function} cb Node-style callback that will return an error on failure or a response
	 * containing a positive status value.
	 */
	runSetGroupContext(groupName, value, cookie, cb) {
		let message = {
			function: "SetGroupContext",
			name: groupName,
			value: value
		};

		if (cookie) {
			message.cookie = cookie;
		}

		this.queryBloombergBridge(message, cb);
	}

}