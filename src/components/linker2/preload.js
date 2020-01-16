if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener('onReady', init);
} else {
	window.addEventListener('FSBLReady', init);
}


async function init() {
	const messages = {};
	FSBL.Clients.LinkerClient.subscribe("symbol", (symbol, response) => {
		// if (!messages.hasOwnProperty(response.data.message_id)) {
		// 	messages[response.data.message_id] = true;
			console.log(response);
			// process message
		// }
	});
}
