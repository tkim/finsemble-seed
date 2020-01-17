if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener('onReady', init);
} else {
	window.addEventListener('FSBLReady', init);
}


async function init() {
	const messages = {};
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
