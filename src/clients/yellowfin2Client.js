// const Finsemble = require("@chartiq/finsemble");
const Logger = FSBL.Clients.Logger;
const RouterClient =  FSBL.Clients.RouterClient;

export function getServerDetails(cb) {
	Logger.log("getServerDetails called");
	RouterClient.query("YF server", { query: "server details" }, function (err, response) {
		Logger.log("Yellowfin2Client.getServerDetails response: ", response.data);
		if (cb) {
			cb(err, response.data);
		}
	});
};

export function getLoginToken(cb) {
	Logger.log("getLoginToken called");
	RouterClient.query("YF server", { query: "login token" }, function (err, response) {
		Logger.log("Yellowfin2Client.getLoginToken response", response.data);
		if (cb) {
			cb(err, response.data);
		}
	});
};

export function getAllUserReports(serverDetails, cb) {
	Logger.log("getAllUserReports called");
	RouterClient.query("YF server", { query: "all reports", server: serverDetails }, function (err, response) {
		Logger.log("Yellowfin2Client.getAllUserReports response", response.data);
		if (cb) {
			cb(err, response.data);
		}
	});
};

