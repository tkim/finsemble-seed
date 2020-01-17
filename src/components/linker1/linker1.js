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
	const subscribedAt = new Date().toISOString();
	const rand = Math.random();
	let timesCalled = 0;
	FSBL.Clients.LinkerClient.subscribe("symbol", (symbol, response) => {
		// if (!messages.hasOwnProperty(response.data.message_id)) {
		// 	messages[response.data.message_id] = true;
			console.log("Subscription handler applied at: " + subscribedAt + 
				"\nRandom number: " + rand + 
				"\ntimes called: " + timesCalled++ + 
				"\n, response:", response);
			// process message
		// }
	});
}
