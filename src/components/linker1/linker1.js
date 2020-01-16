window.launchTutorial = function launchTutorial() {
	FSBL.Clients.LinkerClient.publish({
		dataType:"symbol",
		data: {
			"message_id": new Date().toISOString() + Math.random(), // Add a unique Id on the message.
			payload: "AAPL"
		}
	});
};


if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener('onReady', init);
} else {
	window.addEventListener('FSBLReady', init);
}


function init() {
	FSBL.Clients.LinkerClient.subscribe("symbol", (data, response) => {
		if (!response.originatedHere()) {
			// Use response.originatedHere() if you're trying to prevent the publisher from acting on it's own data.
		}

		if (response.header.origin === 'Routerclient.specificWindowName') {
			// response.header.origin has will look like Routerclient.Welcome Component-2343-2-Finemble
			// You should be able to match the origin to
		}
	});
}
