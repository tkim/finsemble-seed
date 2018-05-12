//replace with import when ready
const Finsemble = require("@chartiq/finsemble");
const $ = require("jquery");

const RouterClient = Finsemble.Clients.RouterClient;
const baseService = Finsemble.baseService;
const util = Finsemble.Util;
const Logger = Finsemble.Clients.Logger;
Logger.start();
const SearchClient = Finsemble.Clients.SearchClient;
SearchClient.initialize();
const LauncherClient = Finsemble.Clients.LauncherClient;
LauncherClient.initialize();

//prod env credentials
let ipp_id = 'knniS7q3hStTMcrz6T4Yy16CI5gc816M9M92b1j9';
let ipp_secret = '4kMIkMsT7BOV4CLqvXllKUftaLwQWRqWlWE9wndH5IT3DzvmF7OKOqO2rCdnEqxcZtpaeoP9VPUfrCEHjDa2NuJdevzqFXhkJmBzKpPvLpfattGLJMkytOYkdMLAZS0F';
let user_email = 'kris@chartiq.com';
let user_pass = '83ipushpullNumbers!';

/**
 * The ipushpull Service receives calls from the ipushpullClient.
 * @constructor
 */
function ipushpullService() {

	let self = this;
	
	this.ipp = ipushpull.create({
		api_url: "https://www.ipushpull.com/api/1.0",
		ws_url: "https://www.ipushpull.com",
		web_url: "https://www.ipushpull.com",
		docs_url: "https://docs.ipushpull.com",
		storage_prefix: "ipp",
		api_key: ipp_id,
		api_secret: ipp_secret,
		transport: "polling"
	});

	this.getLoginToken = function (userDeets, cb) {
		Logger.log("Received getLoginToken call");
		self.ipp.auth.login(userDeets.email, userDeets.password)
		.then(function () {
			Logger.log('IPUSHPULL: done login');
			let tokens = {access_token: self.ipp.api.tokens.access_token, refresh_token: self.ipp.api.tokens.refresh_token};
			Logger.log('IPUSHPULL: tokens: ' + JSON.stringify(tokens, undefined, 2));
			
			cb(null, tokens);
		}).catch(function(err) {
			let msg = 'IPUSHPULL: Error occurred in getLoginToken' ;
			Logger.error(msg, err);
			cb(msg + JSON.stringify(err,undefined, 2), null);
		});		
	};

	this.getUserDetails = function (cb) {
		Logger.log("IPUSHPULL: Received getUserDetails call");
		let deets = {email: user_email, password: user_pass};
		if(cb){
			cb(null, deets);
		} else {
			return deets;
		}
	};

	this.getUserDocs = function (userDeets, cb) {
		Logger.log("IPUSHPULL: Received getUserDocs call with user details " + JSON.stringify(userDeets));

        //self.ipp.auth.login(userDeets.email, userDeets.password).then(self.ipp.api.getDomainsAndPages)
        self.ipp.api.getDomainsAndPages().then(function(res) {
            Logger.log(res.data);
            Logger.log('IPUSHPULL: user docs: ' + JSON.stringify(res.data, undefined, 2));
            cb(null, res.data);
        }).catch(function(err) {
            Logger.error(err);
            let msg = 'IPUSHPULL: Error occurred in getUserDocs' ;
            Logger.error(msg, err);
            cb(msg + JSON.stringify(err,undefined, 2), null);
        });
	};

	this.providerSearchFunction = function (params, callback) {
		// Get reports from the server
		const userDeets = serviceInstance.getUserDetails();
		const text = params.text.toLowerCase();
		serviceInstance.getUserDocs(userDeets, (err, res) => {
			const results = [];
			if (err) {
				//just log it and return no results - otherwise it kills off the search provider
				Logger.error("iPushPull search provider received an error from the iPP API", err);
			} else {
				res.domains.forEach(domain => {
					//if domain matches, add all docs
					if (domain.display_name.toLowerCase().includes(text)) {
						domain.current_user_domain_page_access.pages.forEach(page => {
							const result = {
								name: `${domain.display_name} > ${page.name}`,
								score: 0,
								type: "Application",
								description: page.name,
								actions: [{ name: "Spawn", domain: domain.id, page: page.id }],
								tags: []
							};
							console.log(result);
							results.push(result);
						});
					} else { // test individual docs for match
						domain.current_user_domain_page_access.pages.forEach(page => {
							if (page.name.toLowerCase().includes(text)) {
								const result = {
									name: `${domain.display_name} > ${page.name}`,
									score: 0,
									type: "Application",
									description: page.name,
									actions: [{ name: "Spawn", domain: domain.id, page: page.id }],
									tags: []
								};
								console.log(result);
								results.push(result);
							}
						});
					}
				});
			}

			// Return results when done.
			callback(null, results);
		});
	};

	this.searchResultActionCallback = function (params) {
		Logger.log("Launching iPP doc from search result: ", params);
	
		LauncherClient.spawn("iPushPull",
			{
				url: `https://www.ipushpull.com/embedapp/domains/${params.item.actions[0].domain}/pages/${params.item.actions[0].page}?contrast=dark`,
				addToWorkspace: true
			}, function(err, response){
				console.log("Report showWindow error", response);
			}
		);
		//debugger;
	};

	this.providerActionCallback = function () {
		Logger.log("Spawning Yellowfin report launcher");
	
		LauncherClient.spawn("iPushPull Launcher",
			{
				addToWorkspace: true
			}, function(err, response){
				console.log("Report showWindow error", response);
			}
		);
		//debugger;
	};
	return this;
}

ipushpullService.prototype = new baseService({
	startupDependencies: {
		clients: ["searchClient", "launcherClient"],
		services: ["authenticationService", "routerService"]
	}
});
let serviceInstance = new ipushpullService('ipushpullService');
serviceInstance.onBaseServiceReady(function (callback) {
	
	Logger.log("Adding general purpose Query responder");
	RouterClient.addResponder("iPushPull server", function(error, queryMessage) {
		if (!error) {
			Logger.log('iPushPull server Query: ' + JSON.stringify(queryMessage));

			if (queryMessage.data.query === "login token") {
				if (queryMessage.data.user) {
					serviceInstance.getLoginToken(queryMessage.data.user, queryMessage.sendQueryResponse);
				} else {
					Logger.error("No user specified!: ", queryMessage);
				}

			} else if (queryMessage.data.query === "user details") {
				serviceInstance.getUserDetails(queryMessage.sendQueryResponse);

			} else if (queryMessage.data.query === "user docs") {
				serviceInstance.getUserDocs(queryMessage.data.user, queryMessage.sendQueryResponse);

			} else {
				queryMessage.sendQueryResponse("Unknown query function: " + queryMessage, null);
				Logger.error("Unknown query function: ", queryMessage);
			}
		} else {
			Logger.error("Failed to setup query responder", error);
		}
	});

	Logger.log("Adding iPushPull search provider");
	SearchClient.register(
		{
			name: "iPushPull Pages",
			searchCallback: serviceInstance.providerSearchFunction,
			itemActionCallback: serviceInstance.searchResultActionCallback,	
			providerActionCallback: serviceInstance.providerActionCallback,
			providerActionTitle: "more iPushPull pages"
		},
		function (err) {
			console.log(" iPushPull search provider registration succeeded");
		});

	Logger.log("iPushPull Service ready");
	callback();
});

serviceInstance.start();
window.ipushpull = serviceInstance;


