const Finsemble = require("@chartiq/finsemble");

Finsemble.Clients.Logger.start();
Finsemble.Clients.Logger.log("callRequestListener Service starting up");

// Add and initialize any other clients you need to use (services are initialized by the system, clients are not):
// Finsemble.Clients.AuthenticationClient.initialize();
// Finsemble.Clients.ConfigClient.initialize();
// Finsemble.Clients.DialogManager.initialize();
// Finsemble.Clients.DistributedStoreClient.initialize();
// Finsemble.Clients.DragAndDropClient.initialize();
Finsemble.Clients.LauncherClient.initialize();
// Finsemble.Clients.LinkerClient.initialize();
// Finsemble.Clients.HotkeyClient.initialize();
// Finsemble.Clients.SearchClient.initialize();
// Finsemble.Clients.StorageClient.initialize();
// Finsemble.Clients.WindowClient.initialize();
// Finsemble.Clients.WorkspaceClient.initialize();

// NOTE: When adding the above clients to a service, be sure to add them to the start up dependencies.

//Ensure an instant of this component has been launched and is brought to front when starting a call 
const COMPONENT_TYPE = "Welcome Component";
//response code indicating call was started successfully
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

	/**
	 * Ensure a particular component is on the screen, initiate a call and if successful,
	 * broadcast data about the call for other components to respond to as context.
	 * @param {*} data 
	 */
	makeCall(data) {
		return new Promise(async (resolve) => {
			//Ensure a particular component is open
			await this.ensureOpen();
			//Attempt to initiate the call
			let responseCode = await this.sendRequest(data);
			if(responseCode === RESPONSE_CODE_SUCCESS) {
				// Notify other components by broadcasting context data about the call
				this.broadcastCall(data);
			}
			resolve(responseCode);
		})
	}

	/**
	 * Broadcast context data about the call.
	 * @param {*} data 
	 */
	broadcastCall(data) {
		//TODO: Implement your context broadcast here, for example with an FDC3 desktop agent or the Finsemble ROuterClient
		Finsemble.Clients.RouterClient.transmit("callRequestListener.callStarted", data);
	}

	/**
	 * @param data
	 */
	sendRequest(data) {
		//TODO: Make a request to Cloud 9 service to initiate the call

		// E.g. via the Finsemble RouterClient
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
		// Add query responder for initiating a call
		Finsemble.Clients.RouterClient.addResponder("callRequestListener.makeCall", (err, message) => {
			if (err) {
				return Finsemble.Clients.Logger.error("Failed to setup callRequestListener.makeCall responder", err);
			}

			Finsemble.Clients.Logger.log('callRequestListener Query: ' + JSON.stringify(message));

			try {
				//TODO: add any data validation here and raise an exception if necessary
				
				// Data in query message can be passed as parameters to a method in the service.
				this.makeCall(message.data).then(responseCode => {
					// Send query response to the function call, with optional data, back to the caller.
					message.sendQueryResponse(null, responseCode);
				});
			} catch (e) {
				// If there is an error, send it back to the caller
				message.sendQueryResponse(e);
			}
		});
	}

	/**
	 * Ensure that an instance of nominated component is open, if so bring it to front, or spawn it if not
	 */
	ensureOpen() {
		return new Promise(async (resolve, reject) => {
			// Show the UI if it's up already or spawn it
			  //Additional arguments may be added to the second parameter if you also wish to reposition the component
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
