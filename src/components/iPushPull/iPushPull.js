import $ from "jquery";
import Cookies from 'js-cookie';
import {getUserDetails, getLoginToken}  from '../../services/ipushpull/ipushpullClient';
const Logger = FSBL.Clients.Logger;
const cookie_prefix = 'ipp_test';

//check for ipp cookie, if not present set it and refresh
let access_token = Cookies.get(cookie_prefix + "_access_token");
			
FSBL.addEventListener('onReady', function () {
	$('#app').css('margin-top: 30px');
	FSBL.Clients.WindowClient.setWindowTitle("iPushPull");
	if (!access_token) {
		getUserDetails(function(err, userDetails) {	
			if (err) {
				Logger.error("IPUSHPULL: Error retrieving user details!", err);
			} else {
				Logger.log("IPUSHPULL: Got user details: " + userDetails.email, err);
				getLoginToken({email: userDetails.email, password: userDetails.password}, function (err, response) {
					if (err) {
						Logger.error("IPUSHPULL: Error whilst logging in!", err);
					} else {
						Logger.log("IPUSHPULL: Login successful, response :" + JSON.stringify(response, undefined, 2));
					
						Cookies.set(cookie_prefix + "_access_token", response.access_token);
						Cookies.set(cookie_prefix + "_refresh_token", response.refresh_token);

						location.reload()
					}
				});
			}
		});
	}

	// function setState() {
	// 	let value = {};
	// 	let patharr = document.location.href.split('/');
	// 	for (let a=0; a<patharr.length; a++) {
	// 		if (patharr[a] == 'domain' && a+1<patharr.length) {
	// 			value.domain = patharr[a+1];
	// 			a++;
	// 		} else if (patharr[a] == 'page' && a+1<patharr.length){
	// 			value.page = patharr[a+1];
	// 			a++;
	// 		}
	// 	}
		
	// 	FSBL.Clients.WindowClient.setComponentState({ field: 'location', value: value });
	// }
	
	// function getState() {
	// 	FSBL.Clients.WindowClient.getComponentState({
	// 		field: 'location',
	// 	}, function (err, state) {
	// 		if (state === null) {
	// 			return;
	// 		}
	// 		document.location = state;
	// 	});
	// }

	// function locationHashChanged() {
	// 	setState();
	// }
	// window.onhashchange = locationHashChanged;
});