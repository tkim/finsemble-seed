var originalWindowOpen = window.open;
window.open = function (URL, name, specs, replace) {
	var params = {};
	if (specs) {
		let paramList = specs.split(",");
		for (let i = 0; i < paramList.length; i++) {
			let param = paramList[i].split("=");
			params[param[0]] = param[1];
		}
	}
	if (name) {
		switch (name) {
			case "_self":
				location.href = URL;
				return;
			case "_top":
				window.top.href = URL;
				return;
			case "_parent":
				window.parent.href = URL;
				return;
			case "_blank":
				break;
			default:
				params.name = name;
		}
	}
	params.url = URL;

	var w;
	FSBL.Clients.LauncherClient.spawn(null, params, function (err, response) {
		if (err) {
			FSBL.Clients.Logger.error("overrideLinks: window.open patch error: " + err);
		} else {
			w = response.finWindow;
		}
	});
	return w;
};

/**
 * Initializes the link handler.
 */
const runLinkHandler = () => {
	FSBL.Clients.Logger.log("overrideLinks: Initializing");

	/** Manage links icon clicks no unsolicited windows can be spawned*/
	let navClick = function (event) {
		let $elem = event.currentTarget;
		FSBL.Clients.Logger.log("overrideLinks: navClick element:", $elem);
		let forceSpawnNewWindow = event.shiftKey;

		if(($elem.getAttribute("target") && $elem.getAttribute("target") === "_blank")
			|| forceSpawnNewWindow) {
				FSBL.Clients.Logger.log("overrideLinks: navClick opening new window");
			window.open($elem.getAttribute('href'));
			event.preventDefault();
		} else {
			FSBL.Clients.Logger.log("overrideLinks: navClick doing nothing and NOT preventing default behaviour");
			// document.location.href = $elem.attr('href');
			// document.location.reload();
		}
	};

	let navMdlClick = function (event) {
		if(event.button !== 1 || event.type === "mouseup") {
			FSBL.Clients.Logger.log("overrideLinks: navMdlClick doing nothing for event: ", event);
			return;
		} 
		let $elem = event.currentTarget;
		FSBL.Clients.Logger.log("overrideLinks: navMdlClick opening new window for (middle) click on element: ", $elem);
		// on middle click always open new dash
		window.open($elem.getAttribute('href'));
		event.preventDefault();
	};

	let navClickUnified = function (event) {
		let $elem = event.currentTarget;
		FSBL.Clients.Logger.log("overrideLinks: navClickUnified element:", $elem);

		FSBL.Clients.Logger.log("overrideLinks: received event", event);

		let forceSpawnNewWindow = false;
		let doNothing  = false;
		switch (event.button) {
			case 0:
				if (event.shiftKey) {
					forceSpawnNewWindow = true;
					FSBL.Clients.Logger.log("overrideLinks: navClickUnified left button + shift clicked");
				} else if (event.ctrlKey) {
					forceSpawnNewWindow = true;
					FSBL.Clients.Logger.log("overrideLinks: navClickUnified left button + ctrl clicked");
				} else {
					FSBL.Clients.Logger.log("overrideLinks: navClickUnified left button clicked");
				}
				break;
			case 1:
				forceSpawnNewWindow = true;
				FSBL.Clients.Logger.log("overrideLinks: navClickUnified middle button clicked");
			  	break;
			case 2:
				FSBL.Clients.Logger.log("overrideLinks: navClickUnified right button clicked");
				doNothing = true;
			  	break;
			default:
				FSBL.Clients.Logger.log("overrideLinks: navClickUnified right button clicked");
		  }

		if(($elem.getAttribute("target") && $elem.getAttribute("target") === "_blank")
			|| forceSpawnNewWindow) {
				FSBL.Clients.Logger.log("overrideLinks: navClickUnified opening new window");
			window.open($elem.getAttribute('href'));
			event.preventDefault();
		} else if (doNothing) {
			FSBL.Clients.Logger.log("overrideLinks: navClick doing nothing and NOT preventing default behaviour");
			event.preventDefault();
		} else {
			FSBL.Clients.Logger.log("overrideLinks: navClick doing nothing and NOT preventing default behaviour");
			// document.location.href = $elem.attr('href');
			// document.location.reload();
		}
	};

	let overrideLink = function($elem) {
		if (!$elem.getAttribute('updated')) {
			// classAttr = $elem.attr("class") ? $elem.attr("class").split(" ") : "",
			// whiteListClasses = [];

			// if(_.isArray(classAttr)) {
			// 	whiteListClasses = _.intersection(LINKCLASS_WHITELIST, classAttr);
			// }
			// only 
			if($elem.getAttribute('href') /* && !whiteListClasses.length*/) {
				FSBL.Clients.Logger.debug("overrideLinks: overriding link: ", $elem);
				event.currentTarget.onclick = navClickUnified;
				event.currentTarget.onauxclick = navClickUnified;
				
				// event.currentTarget.onmousedown = navMdlClick;  
				// event.currentTarget.onmouseup = navMdlClick;  
				$elem.setAttribute('updated', true);
			}
		}
	}

	//Override links when the user's mouse is over them
	var aTags = document.body.querySelectorAll("a");
	aTags.forEach(function(aTag) {
		aTag.onmouseover = function() { overrideLink(aTag); };
	});
}

// Startup pattern for preload. Preloads can come in any order, so we need to wait on either the window event or the
// FSBL event
if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", runLinkHandler);
} else {
	window.addEventListener("FSBLReady", runLinkHandler);
}