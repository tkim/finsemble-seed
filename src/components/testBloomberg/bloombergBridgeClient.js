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
	* @typedef worksheet
	* @type {object}
	* @property {string} id The name of the worksheet (non-unique).
	* @property {string} name The name of the worksheet assigned by the Bloomberg terminal and globally unique.
	* @property {boolean} isActive the Worksheet's IsActive status.
	*/

	/**
	* @typedef group
	* @type {object}
	* @property {string} type The type of the group: security or monitor.
	* @property {string} name The name of the group assigned by the Bloomberg terminal, usually takes the form 'Group-A'.
	* @property {string} value the current value of the group.
	*/

	/**
	 * BloombergBridgeClient constructor.
	 * @param {IRouterClient} routerClient An instance of the Finsemble router client to be used for all communication.
	 * @param {ILogger} logger An instance of the Finsemble Logger to be used log messages.
	 */
	constructor(routerClient, logger) {
		this.routerClient = routerClient;
		this.logger = logger;
	}


	/**
	* @callback simpleCallback
	* @param {*} err A string or Object representing an error that occurred while running a function.
	* @param {Object} resp The response to the API call.
	* @param {boolean} resp.status Flag indicating whether the call was successful. A false value will also be accompanied by a message in err
	*/

	/**
	* @callback connectionStatusCallback
	* @param {*} err A string or Object representing an error that occurred while running a function.
	* @param {Object} resp The response to the API call.
	* @param {boolean} resp.registered Flag indicating whether the the BloombergBridge is registered with the Terminal connect API.
	* @param {boolean} resp.loggedIn Flag indicating whether the a user is logged into the terminal. Must be true for any terminal functions to work,.
	*/

	/**
	 * Set a handler function for connection events. 
	 * 
	 * Note that only one handler function is permitted, hence calling
	 * this multiple times will simply replace the existing handler.
	 * 
	 * @param {connectionStatusCallback} cb Callback
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
	* @callback groupEventCallback
	* @param {(string|Object))} err A string or Object representing an error that occurred while running a function.
	* @param {Object} resp The response to the API call.
	* @param {group} resp.group The group thats changed
    * @param {group[]} resp.groups The groups that have changed (usually the same as group)
	*/

	/**
	 * Set a handler function for Launchpad group context changed events.
	 *
	 * Note that only one handler function is permitted, hence calling
	 * this multiple times will simply replace the existing handler.
	 * 
	 * @param {groupEventCallback} cb 
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
	* @callback checkConnectionCallback
	* @param {*} err A string or Object representing an error that occurred while running a function.
	* @param {boolean} resp true if we are logged in and ready to run other commands.
	*/

	/**
	 * Check that Bloomberg bridge is connected to the Bloomberg Terminal and that a user is logged in.
	 * @param {checkConnectionCallback} cb 
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
	 * @param {simpleCallback} cb Node-style callback that will be passed the response from the Bloomberg Bridge. 
	 * Arguments passed to the response vary depending on the function you are running.
	 */
	queryBloombergBridge(message, cb) {
		console.log("BBG_run_terminal_function query:", message);
		this.logger.log("BBG_run_terminal_function query:", message);
		this.routerClient.query("BBG_run_terminal_function", message, this.apiResponseHandler(cb));
	}

	/**
	 * Internal function used to return a call back that will wrap the supplied callback and log all responses
	 * from the Bloomberg Bridge to aid debugging.
	 * @param {simpleCallback} cb Node-style callback to be wrapped.
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
				console.log(msg + JSON.stringify(resp.data, null, 2));
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
	 * @param {simpleCallback} cb
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
	* @callback worksheetCallback
	* @param {(string|Object))} err A string or Object representing an error that occurred while running a function.
	* @param {Object} resp The response to the API call.
	* @param {worksheet} resp.worksheet The worksheet
	*/

	/**
	 * Create a new worksheet with the specified securities and name.
	 * @param {string} worksheetName Name for the worksheet.
	 * @param {Array} securities An array of strings representing one or more securities.
	 * @param {worksheetCallback} cb
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
	 * @callback getAllWorksheetsCallback
	 * @param {(string|Object))} err A string or Object representing an error that occurred while running a function.
	 * @param {Object} resp The response to the API call.
	 * @param {worksheet[]} resp.worksheets The worksheet created
	 */

	/**
	 * Retrieve all worksheets for the user.
	 * @param {getAllWorksheetsCallback} cb
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
	 * @param {worksheetCallback} cb
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
	 * @param {worksheetCallback} cb 
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
	 * @callback getAllGroupsCallback
	 * @param {(string|Object))} err A string or Object representing an error that occurred while running a function.
	 * @param {Object} resp The response to the API call.
	 * @param {group[]} resp.groups An array of all current component groups
	 */
		
	/**
	 * Gets a list of all available Launchpad component groups.
	 * @param {getAllGroupsCallback} cb
	 */
	runGetAllGroups(cb) {
		let message = {
			function: "GetAllGroups"
		};

		this.queryBloombergBridge(message, cb);
	};

	/**
	 * @callback groupCallback
	 * @param {(string|Object))} err A string or Object representing an error that occurred while running a function.
	 * @param {Object} resp The response to the API call.
	 * @param {group} resp.group The group Object
	 */

	/**
	 * Returns details of a Launchpad component group by name.
	 * @param {string} groupName The name of the component group to retrieve.
	 * @param {groupCallback} cb 
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
	 * @param {simpleCallback} cb
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