var symphonyApi = require('./symphony-api/index.js');
const fs = require('fs');
const path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var token;

String.prototype.replaceAll = function (str1, str2, ignore) {
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
}

/**
 * Change thse to point to your POD. Your POD should have two urls: yourpod.symphony.com and yourpod-api.symphony.com.
 */
var urls = {
	keyUrl: 'https://chartiq-api.symphony.com:8444/keyauth',
	sessionUrl: 'https://chartiq-api.symphony.com:8444/sessionauth',
	agentUrl: 'https://chartiq.symphony.com/agent',
	podUrl: 'https://chartiq.symphony.com/pod'
};

// The port for the rest server
var serverPort = 3377;

// Follow Symphony's instructions for creating your client certificate and key.
var appCert = fs.readFileSync(path.join(__dirname, './FinsembleDev-cert.pem'), { encoding: 'utf-8' });
var appKey = fs.readFileSync(path.join(__dirname, './FinsembleDev-key.pem'), { encoding: 'utf-8' });
var appPassphrase = ''; // Put your passphrase for decrypting the certificate at runtime here.
var api;


var cleanStreamId = function (streamId) {
	streamId = streamId.replaceAll("/", "_");
	streamId = streamId.replaceAll("+", "-");
	while (streamId.charAt(streamId.length - 1) == '=') {
		streamId = streamId.substring(0, streamId.length - 1);
	}
	return streamId;
}

function sendMessage(req, res) {
	var params = req.query;
	api.oboUserAuthenticate(params.senderId, token).then(function (userToken) {
		// send message
		function sendMessage(streamId, message) {
			api.message.sendv4(cleanStreamId(streamId), message, {}).then(function (message) {
				res.send('Success');
			}).catch(function (err) {
				res.send(err.toString());
			});
		}

		if (params.streamId) { // If we have a streamId we can directly send a message
			sendMessage(params.streamId, params.message);
		} else { // If not, we need to get a streamId
			api.stream.create([params.receiverId]).then(function (response) {
				sendMessage(response.id, params.message);
			})
		}
	})
}

function _getExternalConnections(params, cb) { // assumes authenticated
	api.connection.list({
		status: "accepted"
	}).then(function (connections) { // connections only returns external users
		var allUsers = [];
		async.each(connections, function (connection, done) {
			api.user.lookup({ uid: connection.userId }).then(function (user) {
				allUsers.push(user);
				done();
			});
		}, function () {
			cb(allUsers);
		})
	});
}

function getExternalConnections(req, res) {
	var params = req.query;
	api.oboUserAuthenticate(params.senderId, token).then(function (userToken) {
		_getExternalConnections(params, function (allUsers) {
			res.send(allUsers);
		})
	});
}

function getUserByName(req, res) {
	var params = req.query;
	api.oboUserAuthenticate(params.senderId, token).then(function (userToken) {
		api.user.search({
			query: params.userName
		}).then(function (internalUsers) {
			if (internalUsers.users && internalUsers.users.length) {
				return res.send(internalUsers.users[0]);
			}
			_getExternalConnections(params, function (allUsers) {
				for (var i = 0; i < allUsers.length; i++) {
					var user = allUsers[i];
					if (params.userName == user.userName) {
						return res.send(user);
					}
				}
				return res.send(null)
			})
		})
	})
}

function setupSymphony(params) {
	api = symphonyApi.create(urls);
	api.setCerts(appCert, appKey, appPassphrase);
	var app;

	if (params && params.app) {
		app = params.app
	} else {
		app = express();
		app.listen(serverPort, function () {
			console.log(`Symphony server listening on port ${serverPort} !` )
		})

	}
	app.use(bodyParser.json());       // to support JSON-encoded bodies
	app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
		extended: true
	}));

	app.all('/sendSymphonyMessage', function (req, res) {
		Object.assign(req.query, req.body);
		if (!token) {
			api.appAuthenticate().then(function (sessionToken) {
				token = sessionToken;
				sendMessage(req, res);
			})
		} else {
			sendMessage(req, res);
		}
	})

	app.all('/getExternalConnections', function (req, res) {
		Object.assign(req.query, req.body);
		if (!token) {
			api.appAuthenticate().then(function (sessionToken) {
				token = sessionToken;
				listConnections(req, res);
			})
		} else {
			listConnections(req, res);
		}
	})

	app.all('/getUserByName', function (req, res) {
		res.header('Access-Control-Allow-Origin', '*');
		Object.assign(req.query, req.body);
		if (!token) {
			api.appAuthenticate().then(function (sessionToken) {
				token = sessionToken;
				getUserByName(req, res);
			})
		} else {
			getUserByName(req, res);
		}
	})

}

module.exports = setupSymphony