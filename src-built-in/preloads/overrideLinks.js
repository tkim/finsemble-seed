


/** Manage links icon clicks no unsolicited windos can be spawned*/
let navClick = function (event) {
	let $elem = $(event.currentTarget);
		
	self.forceSpawnNewDash = event.shiftKey;

	if(($elem.attr("target") && $elem.attr("target") === "_blank")
		|| self.forceSpawnNewDash) {
		window.open($elem.attr('href'));
		event.preventDefault();
	}
};
let navMdlClick = function (event) {
	if(event.button !== 1 || event.type === "mouseup") return;
	let $elem = $(event.currentTarget);
	// on middle click always open new dash
	self.forceSpawnNewDash = true;

	window.open($elem.attr('href'));
	event.preventDefault();
};

window.open = _.wrap(window.open, function(openFn, args) {
	if(args && _.isString(args)) {
		let urlParts = self.parseUrlInToParts(args);
		// Is a short saringstring process !GK's hack 
		if(urlParts[3] && urlParts[3].indexOf("/ux/") === 0) {
			let xo = document.createElement("iframe");
			xo.src = args;
			xo.onload = function() {
				self.navigateUrl(this.contentDocument.location.href);
				xo.remove();
			} 
			document.getElementsByTagName("body")[0].appendChild(xo);
		} else {
			self.navigateUrl(args);
		}
	}
});

_.debounce(() => {
//Intersept any links click
$(document.body).on("mouseover", "a", function(event) {
	let $elem = $(event.currentTarget),
		classAttr = $elem.attr("class") ? $elem.attr("class").split(" ") : "",
		whiteListClasses = [];

	if(_.isArray(classAttr)) {
		whiteListClasses = _.intersection(LINKCLASS_WHITELIST, classAttr);
	}
	// only 
	if($elem.attr('href') && !whiteListClasses.length) {
		event.currentTarget.onclick = navClick;
		event.currentTarget.onmousedown = navMdlClick;  
		event.currentTarget.onmouseup = navMdlClick;  
	}
});
}, 10)();
