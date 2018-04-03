import { getServerDetails, getLoginToken, getAllUserReports } from '../../clients/yellowfin2Client';

let yf_iframe = document.createElement('iframe');
yf_iframe.setAttribute("id", "yf_iframe");
let serverDetails = null;
let destination = null;


function setState() {
	let state = {
		//you could add this to state and then not retrieve from service to permit locking to a server in workspace)
		"serverDetails": serverDetails,
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
		serverDetails = state.serverDetails;
		destination = state.destination;
	});
}

function getServer(cb) {
	if (serverDetails) {
		cb(null, serverDetails);
	} else {
		getServerDetails(cb);
	}
}

FSBL.addEventListener('onReady', function () {
	getState();
	let spawnData = null;
	spawnData = FSBL.Clients.WindowClient.getSpawnData();

	Logger.log("Spawn data: " + JSON.stringify(spawnData, undefined, 2));
	if (spawnData.destination) {
		destination = spawnData.destination;
		Logger.log(`Set destination: ${destination}`); 
	} else {
		Logger.log("no destination details found in spawn data - will launch straight to yellowfin dashboard");
	}
	if (spawnData.server) {
		serverDetails = spawnData.server;
		Logger.log(`Set server details: ${JSON.stringify(destination, undefined, 2)}`); 
	} else {
		Logger.log("no server details found in spawn data - will launch to service's default server");
	}

	getServer(function(err, server) {
		if (err) {
			Logger.error("Failed to retrieve server details: ", err);
		} else {
			serverDetails = server;
			//Logger.log("serverDetails: " + JSON.stringify(serverDetails, undefined, 2));	
			FSBL.Clients.WindowClient.setWindowTitle(`YellowFin (${serverDetails.yellowfinHost}:${serverDetails.yellowfinPort})`);
 
			setState();

			getLoginToken(serverDetails, function(err, token) {
				if (err) {
					//Logger.error("Failed to retreive login token from webservice!");
				} else {
					//Logger.log("Retrieved login token: " + token);
					
					let yfURL = serverDetails.yellowfinProtocol + serverDetails.yellowfinHost + ":" + serverDetails.yellowfinPort + "/logon.i4?LoginWebserviceId=" + token + "&disablelogoff=true&hideheader=true&hidefooter=true";
					if (destination) {
						yfURL += `&entry=${destination}`;
					}
					yf_iframe.setAttribute('src', yfURL);
					yf_iframe.setAttribute('width', window.innerWidth-5);
					yf_iframe.setAttribute('height', window.innerHeight-50);

					document.body.appendChild(yf_iframe);
					$('#yf_iframe').height(window.innerHeight-50);
					$('#yf_iframe').width(window.innerWidth-5);
				}
			});
		}
	});

	FSBL.Clients.WindowClient.setWindowTitle("YellowFin");

	//resize the iframe on window resize
	window.onresize = function() { 
		$('#yf_iframe').height(window.innerHeight-50);
		$('#yf_iframe').width(window.innerWidth-5);
	};


});