import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';
LogRocket.init('l9ijht/fs');
setupLogRocketReact(LogRocket);

function init() {


	// This is an example script - don't forget to change it!
	LogRocket.identify('l9ijht/fs', {
		name: 'Watson',
		email: 'chris.watson@chartiq.com',

		// Add your own custom user variables here, ie:
		sessionName: 'Lightning Talk Test'
	});
	if (window.headerLoaded) return;
	window.headerLoaded = true;
	// Sidd's fix for the react problem when preloading the component
	require("./windowTitleBarComponent.jsx");
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", init);
} else {
	window.addEventListener("FSBLReady", init);
}

