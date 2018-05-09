//replace with import when ready
const Finsemble = require("@chartiq/finsemble");

const RouterClient = Finsemble.Clients.RouterClient;
const baseService = Finsemble.baseService;
const util = Finsemble.Util;
const Logger = Finsemble.Clients.Logger;
Logger.start();

const $ = require("jquery");

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
		Logger.log("Received getUserDetails call");
		cb(null, {email: user_email, password: user_pass});
	};

	this.getUserDocs = function (userDeets, cb) {
		Logger.log("Received getUserDocs call");

        self.ipp.auth.login(userDeets.email, userDeets.password)
		.then(self.ipp.api.getDomainsAndPages)
        .then(function(res) {
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

	return this;
}

ipushpullService.prototype = new baseService({
	startupDependencies: {
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
				serviceInstance.getUserDocs(queryMessage.sendQueryResponse);

			} else {
				queryMessage.sendQueryResponse("Unknown query function: " + queryMessage, null);
				Logger.error("Unknown query function: ", queryMessage);
			}
		} else {
			Logger.error("Failed to setup query responder", error);
		}
	});

	Logger.log("iPushPull Service ready");
	callback();
});

serviceInstance.start();
window.ipushpull = serviceInstance;


