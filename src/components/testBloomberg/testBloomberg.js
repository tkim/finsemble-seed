
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
	//its also possible to poll for connection status, worth doing if the bridge process is killed off
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
	FSBL.Clients.RouterClient.addListener("BBG_connection_status", (err, resp) => {
		console.log("Received connection event... Response: ", resp);
		cb(err, resp);
	});
};
window._checkConnection = (cb) => {
	console.log("Checking connection status...");

	FSBL.Clients.RouterClient.query("BBG_connection_status", {}, (err, resp) => {
		if (err) {
			console.warn("Received error when checking connection status: ", err);
			cb(err, false);
		} else {
			if (resp && resp.data && resp.data["loggedIn"]) {
				console.log("Received status: ", resp.data);
				cb(null, true);
			} else {
				console.log("Received negative or empty response when checking connection status: ", resp);
				cb(null, false);
			}
			
		}
	});
};

window.apiResponseHandler = (cb) => {
	return (err, resp) => {
		if (err) {
			let errMsg = "Error returned by BBG_run_terminal_function: ";
			console.error(errMsg, err);
			FSBL.Clients.Logger.error(errMsg, err);
			cb(err, resp);
		} else if (!resp || !resp.data || !resp.data.status) {
			let errMsg = "Negative status returned by BBG_run_terminal_function: ";
			console.error(errMsg, resp);
			FSBL.Clients.Logger.error(errMsg, resp);
			cb("Command returned negative status", resp);
		} else {
			let msg = "BBG_run_terminal_function successful, response: ";
			console.log(msg, resp.data);
			FSBL.Clients.Logger.log(msg, resp);
			cb(null, resp.data);
		}
	};
};

//-----------------------------------------------------------------------------------------
//functions related to runCommand
window.runBBGCommand = () => {
	hideElements(errorLabel);
	hideElements(successLabel);
	
	let mnemonic = document.getElementById("mnemonic").value;
	mnemonic = mnemonic ? mnemonic.trim() : null;
	let securities = getSecurities("securities");
	let tails = document.getElementById("tails").value;
	tails = tails ? tails.trim() : null;
	let panel = document.getElementById("panel").value;
	
	//validate input
	let error = false;
	if (!mnemonic || mnemonic == "") {
		showElement("mnemonicError");
		error = true;
	}
	//many commands are valid with only one security, most can also be run with none
	// if (!instrument || instrument == "") {
	// 	showElement("securityError");
	// 	error = true;
	// }
	if (!error) {
		_runBBGCommand(mnemonic, securities, panel, tails, (err, response) => {
			if (err) {
				showElement("commandError");
			} else {
				showElement("commandSuccess");
			}
		});
	}
};

window._runBBGCommand = (mnemonic, securities, panel, tails, cb) => {
	
	let message = {
		function: "RunFunction",
		mnemonic: mnemonic,
		securities: securities,
		tails: tails,
		panel: panel
	};

	console.log("BBG_run_terminal_function message:", message);
	FSBL.Clients.RouterClient.query("BBG_run_terminal_function", message, apiResponseHandler(cb));
};

//-----------------------------------------------------------------------------------------
//functions related to worksheets

window.createWorksheet = () => {
	hideElements(errorLabel);
	hideElements(successLabel);

	let worksheetName = document.getElementById("worksheetName").value;
	worksheetName = worksheetName ? worksheetName.trim() : null;
	let securities = getSecurities("worksheetSecurities");

	//validate input
	let error = false;
	if (!worksheetName || worksheetName == "") {
		showElement("worksheetNameError");
		error = true;
	}
	if (!error) {
		_runCreateWorksheet(worksheetName, securities, (err, data) => { 
			if (err) {
				showElement("worksheetError");
			} else {
				renderWorksheet(data.worksheet.name, data.worksheet.id, data.worksheet.securities);
				showElement("worksheetCreateSuccess");
			}
			getAllWorksheets();
		});
	}
};

window._runCreateWorksheet = (worksheetName, securities, cb) => {
	let message = {
		function: "CreateWorksheet",
		name: worksheetName,
		securities: securities
	};

	console.log("BBG_run_terminal_function message:", message);
	FSBL.Clients.RouterClient.query("BBG_run_terminal_function", message, apiResponseHandler(cb));
};

window.getAllWorksheets = () => {
	hideElements(errorLabel);
	hideElements(successLabel);

	_runGetAllWorksheets((err, response) => {
		if (response && response.worksheets && Array.isArray(response.worksheets)) {
			//clear the list
			let theList = document.getElementById("allWorksheets");
			while (theList.lastElementChild) {
				theList.removeChild(theList.lastElementChild);
			}
			//render the updated list
			response.worksheets.forEach(element => {
				let li = document.createElement("li");
				li.id = "li_worksheet_" + element.id;
				li.className = "hover";
				li.onclick = (e) => {
					e.preventDefault();
					loadWorkSheet(element.id);
				};
				li.appendChild(document.createTextNode(element.name));

				theList.appendChild(li);
			});
		} else {
			console.error("invalid response from _runGetAllWorksheets", response);
			showElement("allWorksheetsError");
		}
	});
};

window._runGetAllWorksheets = (cb) => {
	let message = {
		function: "GetAllWorksheets"
	};

	console.log("BBG_run_terminal_function message:", message);
	FSBL.Clients.RouterClient.query("BBG_run_terminal_function", message, apiResponseHandler(cb));
};

window.loadWorkSheet = (worksheetId) => {
	hideElements(errorLabel);
	hideElements(successLabel);
	
	_runGetWorksheet(worksheetId, (err, response) => {
		//TODO: support other types of worksheet
		if (response && response.worksheet && Array.isArray(response.worksheet.securities)) {
			renderWorksheet(response.worksheet.name, response.worksheet.id, response.worksheet.securities);
		} else {
			console.error("invalid response from _runGetWorksheet");
			showElement("worksheetError");
		}
	
	});
};

window._runGetWorksheet = (worksheetId, cb) => {
	let message = {
		function: "GetWorksheet",
		id: worksheetId
	};

	console.log("BBG_run_terminal_function message:", message);
	FSBL.Clients.RouterClient.query("BBG_run_terminal_function", message, apiResponseHandler(cb));
};

window.replaceWorksheet = () => {
	hideElements(errorLabel);
	hideElements(successLabel);

	let worksheetId = document.getElementById("worksheetId").value;
	worksheetId = worksheetId ? worksheetId.trim() : null;
	let securities = getSecurities("worksheetSecurities");

	//validate input
	let error = false;
	if (!worksheetId || worksheetId == "") {
		showElement("worksheetIdError");
		error = true;
	}
	if (!error) {
		_runReplaceWorksheet(worksheetId, securities, (err, data) => {
			if (err) {
				showElement("worksheetError");
			} else {
				renderWorksheet(data.worksheet.name, data.worksheet.id, data.worksheet.securities);
				showElement("worksheetSaveSuccess");
			}
			getAllWorksheets();
		});
	}
};

window._runReplaceWorksheet = (worksheetId, securities, cb) => {
	let message = {
		function: "ReplaceWorksheet",
		id: worksheetId,
		securities: securities
	};
	console.log("BBG_run_terminal_function message:", message);
	FSBL.Clients.RouterClient.query("BBG_run_terminal_function", message, apiResponseHandler(cb));
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

window.showElement = (id) => {
	let element = document.getElementById(id);
	element.classList.remove("hidden");
};

window.hideElement = (id) => {
	let element = document.getElementById(id);
	element.classList.add("hidden");
};

window.hideElements = (className) => {
	Array.from(document.getElementsByClassName(className)).forEach((el) => {
		el.classList.add("hidden");
	});
}

window.showConnectedIcon = () => {
	document.getElementById("connectedIndicator").classList.remove("hidden");
	document.getElementById("disconnectedIndicator").classList.add("hidden");
}

window.showDisconnectedIcon = () => {
	document.getElementById("connectedIndicator").classList.remove("hidden");
	document.getElementById("disconnectedIndicator").classList.add("hidden");
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

window.addSecurity = (input, list, sector) => {
	let security = document.getElementById(input).value;
	if (security) {
		hideElement("securityError");
		if (sector) {
			security = security + " " + sector;
		}

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

window.renderWorksheet = (worksheetName, id, securities) => {
	//clear the list
	let theList = document.getElementById("worksheetSecurities");
	while (theList.lastElementChild) {
		theList.removeChild(theList.lastElementChild);
	}
	//render the updated list
	securities.forEach(element => {
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
	document.getElementById("worksheetId").value = id;
};

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}