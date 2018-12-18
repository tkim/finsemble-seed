var Api = require('./lib/Api');
exports.AuthModel = require('./lib/AuthModel');
exports.AppAuthModel = require('./lib/AppAuthModel');
exports.FeedModel = require('./lib/FeedModel');
exports.MessageModel = require('./lib/MessageModel');
exports.ConnectionModel = require('./lib/ConnectionModel');

exports.create = function(urls)
{
	return new Api(urls);
}
