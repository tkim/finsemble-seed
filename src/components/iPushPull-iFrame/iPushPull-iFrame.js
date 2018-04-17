let $ = require('jquery');
const Logger = FSBL.Clients.Logger;
import {getUserDetails, getLoginToken}  from '../../services/ipushpull/ipushpullClient';

FSBL.addEventListener('onReady', function () {
	Logger.log("IPUSHPULL: iPushPull comp ready");
	//create the iFrame for iPushPull embedapp
	var iframe = document.createElement("iframe");
	iframe.name = "ipushpull";
	iframe.id = "ipp_frame";
	document.body.appendChild(iframe);
	
	//set title and auto-scale the iframe
	FSBL.Clients.WindowClient.setWindowTitle("iPushPull");
	$('#ipp_frame').height(window.innerHeight-30);
	$('#ipp_frame').width(window.innerWidth);
	//resize the iframe on window resize
	window.onresize = function() { 
		$('#ipp_frame').height(window.innerHeight-30);
		$('#ipp_frame').width(window.innerWidth);
	};

	//setup URL for the iFrame
	let url = "https://test.ipushpull.com/set.php?";
	//"https://www.ipushpull.com/embedapp/?contrast=dark";
	
	let user = null, pass = null;
	getUserDetails(function(err, userDetails) {
		if (err) {
			Logger.error("IPUSHPULL: Error retrieving user details!", err);
		} else {
			user = userDetails.email;
			pass = userDetails.password;
			Logger.log("IPUSHPULL: user details retrieved, user: " + user, err);
			getLoginToken({email: user, password: pass}, function (err, response) {
				if (err) {
					Logger.error("IPUSHPULL: Error whilst logging in!", err);
				} else {
					Logger.log("IPUSHPULL: Login successful, response :" + JSON.stringify(response, undefined, 2));
				
					//add tokens to the URL here
					url += `&access_token=${response.access_token}&refresh_token=${response.refresh_token}`;
					iframe.src = url;
				}
			});
		}
	});
});