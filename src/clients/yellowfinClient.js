// const Finsemble = require("@chartiq/finsemble");
const Logger = FSBL.Clients.Logger;
const RouterClient =  FSBL.Clients.RouterClient;

export function getServerDetails(cb) {
	Logger.log("getServerDetails called");
	RouterClient.query("YF server", { query: "server details" }, function (err, response) {
		Logger.log("YellowfinClient.getServerDetails response: ", response.data);
		if (cb) {
			cb(err, response.data);
		}
	});
};

export function getLoginToken(serverDeets, cb) {
	Logger.log("getLoginToken called");
	RouterClient.query("YF server", { query: "login token", server: serverDeets }, function (err, response) {
		Logger.log("YellowfinClient.getLoginToken response", response.data);
		if (cb) {
			cb(err, response.data);
		}
	});
};

export function getAllUserReports(serverDeets, cb) {
	Logger.log("getAllUserReports called");
	RouterClient.query("YF server", { query: "all reports", server: serverDeets }, function (err, response) {
		Logger.log("YellowfinClient.getAllUserReports response", response.data);
		if (cb) {
			cb(err, response.data);
		}
	});
};

