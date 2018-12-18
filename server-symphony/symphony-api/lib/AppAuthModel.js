'use strict'
var Q = require('q');
var RequestModel = require('./RequestModel');

class AppAuthModel extends RequestModel {
	constructor(authBase, keyBase, certOptions) {
		super(certOptions);

		this.authBase = authBase;
		this.keyBase = keyBase;
	}

	authenticate() {
		return this.request(this.authBase + '/v1/app/authenticate', 'POST');
	}

	authenticateUser(userId, sessionToken) {
		return this.request(this.authBase + '/v1/app/user/' + userId + '/authenticate', 'POST', { headers: { sessionToken: sessionToken } })
	}
}

module.exports = AppAuthModel;
