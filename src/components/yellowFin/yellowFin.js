const $ = require("jquery");
const jQuery = $;
const Logger = FSBL.Clients.Logger;
import {getServerDetails, getLoginToken, getAllUserReports} from '../../clients/yellowfin2Client';

let iframe = document.createElement('iframe');
let serverDetails = null;
let destination = null;

function setState() {
	let state = {
		//you could add this to state and then not retrieve from service to permit locking to a server in workspace)
		// "serverDetails": serverDetails,
		"destination": destination
	};
	FSBL.Clients.WindowClient.setComponentState({ field: 'yfState', value: state });
}

function getState() {
	FSBL.Clients.WindowClient.getComponentState({
		field: 'yfState',
	}, function (err, state) {
		if (!state) {
			return;
		}
		//you could add this to state and then not retrieve from service to permit locking to a server in workspace)
		// serverDetails = state.serverDetails;
		destination = state.destination;
	});
}

FSBL.addEventListener('onReady', function () {
	getState();

	let spawnData = FSBL.Clients.WindowClient.getSpawnData();
	Logger.log("Spawn data: " + JSON.stringify(spawnData));
	if (spawnData){
		if (spawnData.destination) {
			destination = spawnData.destination;
			Logger.log(`Set destination: ${destination}`); 
		} else {
			Logger.log("no destination details found in spawn data - will launch straight to yellowfin dashboard");
		}
	}

	getServerDetails(function(err,server) {
		if (err) {
			Logger.error("Failed to retrieve server details: ", err);
		} else {
			serverDetails = server;
			Logger.log("serverDetails: " + JSON.stringify(serverDetails, undefined, 2));	
			FSBL.Clients.WindowClient.setWindowTitle(`YellowFin (${serverDetails.yellowfinHost}:${serverDetails.yellowfinPort})`);
 
			setState();

			getLoginToken(function(err, token) {
				if (err) {
					Logger.error("Failed to retreive login token from webservice!");
				} else {
					Logger.log("Retrieved login token: " + token);
					
					let yfURL = serverDetails.yellowfinProtocol + serverDetails.yellowfinHost + ":" + serverDetails.yellowfinPort + "/logon.i4?LoginWebserviceId=" + token + "&disablelogoff=true&hideheader=true&hidefooter=true";
					if (destination) {
						yfURL += `&entry=${destination}`;
					}
					iframe.setAttribute('src', yfURL);
					iframe.setAttribute('width', window.innerWidth-5);
					iframe.setAttribute('height', window.innerHeight-50);

					document.body.appendChild(iframe);
					$('iframe').height(window.innerHeight-50);
					$('iframe').width(window.innerWidth-5);
				}
			});
		}
	});

	FSBL.Clients.WindowClient.setWindowTitle("YellowFin");

	//resize the iframe on window resize
	window.onresize = function() { 
		$('iframe').height(window.innerHeight-50);
		$('iframe').width(window.innerWidth-5);
	};

	
}); 