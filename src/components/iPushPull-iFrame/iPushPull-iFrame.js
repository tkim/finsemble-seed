let $ = require('jquery');
const Logger = FSBL.Clients.Logger;
import {getUserDetails, getLoginToken}  from '../../services/ipushpull/ipushpullClient';

FSBL.addEventListener('onReady', function () {
	FSBL.Clients.WindowClient.setWindowTitle("iPushPull");
	$('#ipp_frame').height(window.innerHeight-30);
	$('#ipp_frame').width(window.innerWidth);

	let user = null, pass = null;
	getUserDetails(function(err, userDetails) {
		if (err) {
			Logger.error("IPUSHPULL:Error retrieving user details!", err);
		} else {
			user = userDetails.email;
			pass = userDetails.password;

			getLoginToken({email: user, password: pass}, function (err, response) {
				if (err) {
					Logger.error("IPUSHPULL: Error whilst logging in!", err);
				} else {
					Logger.log(IPUSHPULL:"Login successful, response :" + JSON.stringify(response, undefined, 2));
				}
			});

		}
	});

	//resize the iframe on window resize
	window.onresize = function() { 
		$('#ipp_frame').height(window.innerHeight-30);
		$('#ipp_frame').width(window.innerWidth);
	};

});