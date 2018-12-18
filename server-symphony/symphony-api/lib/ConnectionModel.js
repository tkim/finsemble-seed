var Q = require('q');
var RequestModel = require('./RequestModel');
var urljoin = require('url-join');

class ConnectionModel extends RequestModel {
	constructor (podBaseUrl, certOptions, headers)
	{
		super(certOptions, headers);
		this.podBaseUrl = podBaseUrl;
	}

	list (params)
	{
		return this.request(urljoin(this.podBaseUrl, '/v1/connection/list'), 'GET', {params : params})
	}
}

module.exports = ConnectionModel;
