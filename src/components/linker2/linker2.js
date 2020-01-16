window.launchTutorial = function launchTutorial() {
	FSBL.Clients.LinkerClient.publish({
		dataType:"symbol",
		data:"AAPL"
	});
};

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener('onReady', init);
} else {
	window.addEventListener('FSBLReady', init);
}

let currentChannel = null;

async function init() {
	// let current = await FSBL.Clients.LinkerClient.getState();
	// currentChannel =  current.channels[0].name;

	FSBL.Clients.LinkerClient.onStateChange(async (err, response) => {
		// let channelToRemove = '';
		//
		// if (response.channels.length > 1) {
		// 	response.channels.forEach((channel) => {
		// 		if (currentChannel !== channel.name) {
		// 			currentChannel = channel.name;
		// 		} else {
		// 			channelToRemove = channel.name;
		// 		}
		// 	});
		// 	FSBL.Clients.LinkerClient.unlinkFromChannel(channelToRemove,null);
		//
		// }
	});

	FSBL.Clients.LinkerClient.subscribe("symbol", (symbol, response) => {
		console.log("in Linker 2", symbol, response);
	});
}
