
//references to securities set on the runCommand form
let UIReady = false;

//-----------------------------------------------------------------------------------------
//Ready function that sets up the form
const FSBLReady = () => {
	try {
		setupFormUX();
		UIReady = true;
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

//-----------------------------------------------------------------------------------------
//functions related to connection status

//TODO: extend status checks to determine if user is logged (once supported by native code)

window.setupConnectionLifecycleChecks = () => { 
	//listen for connection events (listen/transmit)
	_listenForConnectionEvents(checkConnection);
	//do the initial check
	checkConnection();
	//poll as well as the system switches to a query responder when connected
	setInterval(checkConnection, 30000);
};

window.checkConnection = () => {
	_checkConnection((err, resp) => { 
		if (resp) {
			showConnectedIcon();
		} else {
			showDisconnectedIcon();
		}
	});
};

/** Callback is called only on disconnect to trigger polling. */
window._listenForConnectionEvents = (cb) => {
	console.log("Listening for connection events...");
	FSBL.Clients.RouterClient.addListener("BBG_ready", (err, resp) => {
		console.log("Received connection event... Response: ", resp);
		cb(err, resp);
	});
};
window._checkConnection = (cb) => {
	console.log("Checking connection status");

	FSBL.Clients.RouterClient.query("BBG_ready", {}, (err, resp) => {
		if (err) {
			console.warn("Received error when checking connection status: ", err);
			cb(err, false);
		} else {
			if (resp && resp.data) {
				cb(null, true);
			} else {
				console.log("Received negative or empty response when checking connection status: ", resp);
				cb(null, false);
			}
			
		}
	});
};

//-----------------------------------------------------------------------------------------
//functions related to runCommand
window.runBBGCommand = () => {
	let mnemonic = document.getElementById("mnemonic").value;
	mnemonic = mnemonic ? mnemonic.trim() : null;
	//TODO: integration currently only supports one security, so use the first one
	let instrument = getSecurities("securities")[0];
	let tails = document.getElementById("tails").value;
	tails = tails ? tails.trim() : null;
	let panel = document.getElementById("panel").value;
	
	//validate input
	let error = false;
	if (!mnemonic || mnemonic == "") {
		showError("mnemonicError");
		error = true;
	}
	//many commands are valid with only one security
	// if (!instrument || instrument == "") {
	// 	showError("securityError");
	// 	error = true;
	// }
	if (!error) {
		_runBBGCommand(mnemonic, instrument, panel, tails)
	}
};

window._runBBGCommand = (mnemonic, instrument, panel, tails) => {
	let message = {
		mnemonic: mnemonic,
		"fdc3.instrument": { "id": { "ticker": instrument } },
		tails: tails,
		panel: panel
	};

	console.log("Transmitting BBG_run_function message:", message);
	FSBL.Clients.RouterClient.transmit("BBG_run_function", message);
};

//-----------------------------------------------------------------------------------------
//functions related to worksheets

window.createWorksheet = () => {
	let worksheetName = document.getElementById("worksheetName").value;
	worksheetName = worksheetName ? worksheetName.trim() : null;
	let securities = getSecurities("worksheetSecurities");

	//validate input
	let error = false;
	if (!worksheetName || worksheetName == "") {
		showError("worksheetNameError");
		error = true;
	}
	if (!error) {
		_runCreateWorksheet(worksheetName, securities);
		
		//wait a bit then reload worksheets
		//TODO: fix this when there is a return from _runCreateWorksheet
		setTimeout(getAllWorksheets, 1000);
	}
};

window._runCreateWorksheet = (worksheetName, securities) => {
	let message = {
		worksheet: worksheetName,
		securities: securities
	};

	console.log("Transmitting BBG_create_worksheet message:", message);
	FSBL.Clients.RouterClient.transmit("BBG_create_worksheet", message);
};

window.getAllWorksheets = () => {
	_runGetAllWorksheets((err, response) => {
		if (response) {
			if (Array.isArray(response)) {
				//clear the list
				let theList = document.getElementById("allWorksheets");
				while (theList.lastElementChild) {
					theList.removeChild(theList.lastElementChild);
				}
				//render the updated list
				response.forEach(element => {
					let li = document.createElement("li");
					li.id = "li_worksheet_" + element;
					li.className = "hover";
					li.onclick = (e) => {
						e.preventDefault();
						loadWorkSheet(element);
					};
					li.appendChild(document.createTextNode(element));

					theList.appendChild(li);
				});
			} else {
				console.error("invalid response from _runGetAllWorksheets");
			}
		}
	});
};

window._runGetAllWorksheets = (cb) => {
	console.log("Querying BBG_get_worksheets_of_user");
	FSBL.Clients.RouterClient.query("BBG_get_worksheets_of_user", {}, (err, response) => {
		if (err) {
			console.error("error: ", err);
			cb(err);
		} else if (response.data) {
			console.log("all worksheets: ", response.data);
			cb(null, response.data);
		} else {
			cb(new Error("Response from BBG_get_worksheets_of_user was empty... response: " + JSON.stringify(response)));
		}
	});
};

window.loadWorkSheet = (worksheetName) => {
	//TODO: the worksheet name should be swapped out for the worksheet ID as names are not unique
	_runGetWorksheet(worksheetName, (err, response) => {
		//TODO: support other types of worksheet
		if (response && response.securities) {
			if (Array.isArray(response.securities)) {
				//clear the list
				let theList = document.getElementById("worksheetSecurities");
				while (theList.lastElementChild) {
					theList.removeChild(theList.lastElementChild);
				}
				//render the updated list
				response.securities.forEach(element => {
					let li = document.createElement("li");
					li.id = "li_security_" + element;
					li.appendChild(document.createTextNode(element));

					let removeButton = document.createElement("button");
					removeButton.className = "removeButton";
					removeButton.textContent = " X ";
					removeButton.onclick = (e) => {
						e.preventDefault();
						window.removeSecurity(element, "worksheetSecurities");
					};

					li.appendChild(removeButton);

					theList.appendChild(li);
				});
				document.getElementById("worksheetName").value = worksheetName;
			} else {
				console.error("invalid response from _runGetWorksheet");
			}
		}
	});
};

window._runGetWorksheet = (worksheetName, cb) => {
	console.log("Querying BBG_GetSecuritiesFromWorksheet");
	FSBL.Clients.RouterClient.query("BBG_Get_Securities_From_Worksheet", { worksheet: worksheetName }, (err, response) => {
		if (err) {
			console.error("error: ", err);
			cb(err);
		} else if (response.data) {
			console.log(`data from worksheet '${worksheetName}: `, response.data);
			cb(null, response.data);
		} else {
			cb(new Error("Response from BBG_GetSecuritiesFromWorksheet was empty... response: " + JSON.stringify(response)));
		}
	});
};

window._runReplaceWorksheet = () => {

};



//-----------------------------------------------------------------------------------------
//UI functions related to components




//-----------------------------------------------------------------------------------------
//Util functions for the form UI

// auto-hit add button on enter
const setupFormUX = () => {
	console.log("Setting up form UX");
	clickButtonOnEnter("securityInput", "addSecurityButton");
	clickButtonOnEnter("mnemonic", "runCommandButton");
	clickButtonOnEnter("createWorksheetSecurityInput", "cwAddSecurityButton");
	setupConnectionLifecycleChecks();
};

const displayType = (heading, column) => {
	if (UIReady) {
		// first child of the parent node
		let sibling = heading.parentNode.firstChild;

		// process all siblings of the selected heading 
		while (sibling) {
			if (sibling.nodeType === 1) {
				if (sibling !== heading) {
					sibling.className = "heading";
				}
			}
			sibling = sibling.nextSibling;
		}
		heading.className = "heading active";

		// process all siblings of the selected column
		sibling = column.parentNode.firstChild;
		while (sibling) {
			if (sibling.nodeType === 1) {
				if (sibling !== column) {
					sibling.className = "column hidden";
				}
			}
			sibling = sibling.nextSibling;
		}
		column.className = "column";

	} else {
		console.warn("User clicked on header before UI was ready, ignoring...");
	}
};

window.displayCol = (elementName) => {
	displayType(document.getElementById(elementName + "Heading"), document.getElementById(elementName + "Col"));
	//do any custom functionality for particular cols
	switch (elementName) {
		case "worksheets":
			window.getAllWorksheets();
			break;

		default:
			break;
	}
};

window.showError = (errorId) => {
	document.getElementById(errorId).className = "errorLabel";
};

window.hideError = (errorId) => {
	document.getElementById(errorId).className = "errorLabel hidden";
};

window.showConnectedIcon = () => {
	document.getElementById("connectedIndicator").className = "";
	document.getElementById("disconnectedIndicator").className = "hidden";
}

window.showDisconnectedIcon = () => {
	document.getElementById("connectedIndicator").className = "hidden";
	document.getElementById("disconnectedIndicator").className = "";
}

window.clickButtonOnEnter = (fieldId, buttonId) => {
	document.getElementById(fieldId).addEventListener("keyup", function (event) {
		// Number 13 is the "Enter" key on the keyboard
		if (event.keyCode === 13) {
			// Cancel the default action, if needed
			event.preventDefault();
			// Trigger the button element with a click
			document.getElementById(buttonId).click();
		}
	});
}

window.addSecurity = (input, list) => {
	let security = document.getElementById(input).value;
	if (security) {
		hideError("securityError");

		let li = document.createElement("li");
		li.id = "li_security_" + security;
		li.appendChild(document.createTextNode(security));

		let removeButton = document.createElement("button");
		removeButton.className = "removeButton";
		removeButton.textContent = " X ";
		removeButton.onclick = (e) => {
			e.preventDefault();
			window.removeSecurity(security, list);
		};

		li.appendChild(removeButton);

		document.getElementById(list).appendChild(li);
		document.getElementById(input).value = "";
	} else {
		console.warn(`Already added security '${security}', ignoring...`);
	}
};

window.removeSecurity = (security, list) => {
	let element = document.getElementById("li_security_" + security);
	if (element) {
		document.getElementById(list).removeChild(element);
	}
};

window.getSecurities = (list) => {
	let element = document.getElementById(list).firstChild;
	let securitiesArr = [];
	while (element) {
		if (element.nodeType === 1) {

			securitiesArr.push(element.firstChild.textContent);
		}
		element = element.nextSibling;
	}
	return securitiesArr;
};

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}