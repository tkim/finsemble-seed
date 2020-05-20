const FSBLReady = () => {
	try {
		document.getElementById("call-button").addEventListener("click", makeCall)
		FSBL.Clients.RouterClient.addListener("callRequestListener.callStarted", listenForCall);
		// Do things with FSBL in here.
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}

const makeCall = () => {
	let callData = {
		"contactId": "1",
		"name": "Bob Smith",
		"phoneNumber": "+4477733322244",
		"meta": {
			"time": new Date().toISOString()
		}
	}
	FSBL.Clients.RouterClient.query("callRequestListener.makeCall", callData, (err, response) => {
		if (err) {
			console.error(err);
		}
	})
};


const listenForCall = (err, response) => {
	if (err) {
		console.error(err)
	} else {
		document.getElementById("call-details").innerText = `Call made to ${response.data.name} at ${response.data.meta.time}`
	}
}
