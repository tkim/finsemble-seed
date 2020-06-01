
//references to securities set on the runCommand form
let securities = {};
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
//UI functions related to runCommand
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
	if (!instrument || instrument == "") {
		showError("securityError");
		error = true;
	}
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
//UI functions related to createWorksheet






//-----------------------------------------------------------------------------------------
//Util functions for the form UI

// auto-hit add button on enter
const setupFormUX = () => {
	console.log("Setting up form UX");
	document.getElementById("securityInput").addEventListener("keyup", function (event) {
		// Number 13 is the "Enter" key on the keyboard
		if (event.keyCode === 13) {
			// Cancel the default action, if needed
			event.preventDefault();
			// Trigger the button element with a click
			document.getElementById("addSecurityButton").click();
		}
	});

	document.getElementById("mnemonic").addEventListener("keyup", function (event) {
		// Number 13 is the "Enter" key on the keyboard
		if (event.keyCode === 13) {
			// Cancel the default action, if needed
			event.preventDefault();
			// Trigger the button element with a click
			document.getElementById("runCommandButton").click();
		}
	});

	
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
};

window.showError = (errorId) => {
	document.getElementById(errorId).className = "errorLabel";
};

window.hideError = (errorId) => {
	document.getElementById(errorId).className = "errorLabel hidden";
};

window.addSecurity = (input, list) => {
	let security = document.getElementById(input).value;
	if (security && !securities[security]) {
		hideError("securityError");
		securities[security] = security;

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
	if (securities[security]) {
		let element = document.getElementById("li_security_" + security);
		if (element) {
			document.getElementById(list).removeChild(element);
		}
		delete securities[security];
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