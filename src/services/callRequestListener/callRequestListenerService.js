const Finsemble = require("@chartiq/finsemble");

Finsemble.Clients.Logger.start();
Finsemble.Clients.Logger.log("callRequestListener Service starting up");

Finsemble.Clients.LauncherClient.initialize();
// NOTE: When adding the above clients to a service, be sure to add them to the start up dependencies.


const COMPONENT_TYPE = "Welcome Component";
const RESPONSE_CODE_SUCCESS = 0


class callRequestListenerService extends Finsemble.baseService {
	/**
	 * Initializes a new instance of the callRequestListenerService class.
	 */
	constructor() {
		super({
			// Declare any service or client dependencies that must be available before your service starts up.
			startupDependencies: {
				// If the service is using another service directly via an event listener or a responder, that service
				// should be listed as a service start up dependency.
				services: [],
				// When ever you use a client API with in the service, it should be listed as a client startup
				// dependency. Any clients listed as a dependency must be initialized at the top of this file for your
				// service to startup.
				clients: ["launcherClient"]
			}
		});

		this.readyHandler = this.readyHandler.bind(this);

		this.onBaseServiceReady(this.readyHandler);
	}

	/**
	 * Fired when the service is ready for initialization
	 * @param {function} callback
	 */
	readyHandler(callback) {
		this.createRouterEndpoints();
		Finsemble.Clients.Logger.log("callRequestListener Service ready");
		callback();
	}

	makeCall(data) {
		return new Promise(async (resolve) => {
			await this.ensureOpen();
			let responseCode = await this.sendRequest(data);
			if(responseCode === RESPONSE_CODE_SUCCESS) {
				// Notify components that can provide context for the call
				this.broadcastCall(data);
			}
			resolve(responseCode);
		})
	}

	broadcastCall(data) {
		Finsemble.Clients.RouterClient.transmit("callRequestListener.callStarted", data);
	}

	/**
	 * @param data
	 */
	sendRequest(data) {
		// Make http request to Cloud 9 service as you normally wyould

		// Alternatively Send request via Router
		// return new Promise((resolve, reject) => {
		// 	Finsemble.Clients.RouterClient.query(
		// 		"C9.channel.if.finsemble",
		// 		{},
		// 		((err, response) => {
		// 			if(err) {
		// 				reject(err)
		// 				return;
		// 			}
		// 			resolve(RESPONSE_CODE_SUCCESS) // successful response
		// 		})
		// 	)
		// });
		//

		// Successful response code
		return RESPONSE_CODE_SUCCESS;
	}


	/**
	 * Creates a router endpoint for you service.
	 * Add query responders, listeners or pub/sub topic as appropriate.
	 */
	createRouterEndpoints() {
		// Add responder for myFunction
		Finsemble.Clients.RouterClient.addResponder("callRequestListener.makeCall", (err, message) => {
			if (err) {
				return Finsemble.Clients.Logger.error("Failed to setup callRequestListener.makeCall responder", err);
			}

			Finsemble.Clients.Logger.log('callRequestListener Query: ' + JSON.stringify(message));

			try {
				// Data in query message can be passed as parameters to a method in the service.
				this.makeCall(message.data).then(responseCode => {
					message.sendQueryResponse(null, responseCode);
				});

				// Send query response to the function call, with optional data, back to the caller.
			} catch (e) {
				// If there is an error, send it back to the caller
				message.sendQueryResponse(e);
			}
		});
	}

	ensureOpen() {
		return new Promise(async (resolve, reject) => {
			// Show the UI if it's up already or spawn it
			let {err, response} = await Finsemble.Clients.LauncherClient.showWindow(
				{"componentType": COMPONENT_TYPE},
				{"spawnIfNotFound": true}
			);

			if (err) {
				reject(err);
				// Log the error
			} else {
				resolve()
			}
		});
	}
}

const serviceInstance = new callRequestListenerService();

serviceInstance.start();
module.exports = serviceInstance;
