console.log('mindcontrol - symphony');

function readyFn () {
	FSBL.$ = require('./jQuery.js');
	
	// Style Overrides
	FSBL.$(document.body).append('<style>'+require('./symphony.css')+'</style>');

	var Symphony = window.require ? window.require("symphony-core") : null;
	
	FSBL.Clients.DistributedStoreClient.createStore({
		store: "Symphony", global: true, values: {
			'primarySymphonyWindow': FSBL.Clients.WindowClient.windowName
		}
	}, function (err, globalStore) {

		function launchIfNeeded(chatDescriptor) {
			chatDescriptor.fromUser = Symphony.Application.getDataStore()["resources"].users.models[0].attributes
			chatDescriptor.chatId = chatDescriptor.userID ? chatDescriptor.userID : chatDescriptor.viewID;

			// Update a linked chat window or create a new one for this user if no linked chat window exists
			FSBL.Clients.DragAndDropClient.openSharedData({
				data: {
					"symphony.chat": {
						chatDescriptor: chatDescriptor
					}
				}
			});
		}

		FSBL.Clients.WindowClient.setWindowTitle("Symphony");


		// prevent multiple clicks
		var lastClicked;
		function setLastClicked(text) {
			lastClicked = text;
			setTimeout(function () {
				lastClicked = '';
			}, 3000);
		}

		function navClickHandler(nameDiv) {
			var text = nameDiv.text();
			if (lastClicked === text) {
				return;
			} else {
				setLastClicked(text);
			}
			// Wait for the chat window to load, once loaded, spawn a new chat window with the chat Id and Header

			function waitForChat() {
				var chatLoaded = false;
				var chatTitles = FSBL.$('.truncate-text');
				if (!chatTitles.length) chatTitles = FSBL.$('.chat-room-header__name');

				console.log("CHAT TITLES", chatTitles);
				chatTitles.each(function (key, value) {
					var chatHeader = FSBL.$(value);
					if (chatHeader.text().trim() === text) {
						chatLoaded = true;
						var chatDescriptor = {
							header: text
						};

						chatDescriptor.userID = chatHeader.attr('data-userid');
						if (!chatDescriptor.userID) {
							chatDescriptor.viewID = chatHeader.closest('[data-viewid]').attr('data-viewid').split("chatroom")[1];
						}
						launchIfNeeded(chatDescriptor);
						return false;
					}
				});
				if (!chatLoaded) {
					return setTimeout(waitForChat, 250);
				}

			}
			waitForChat();
		}

		// Catch navigation clicks - this is needed to catch clicks on the entire div as opposed to just the name
		FSBL.$(document).on('click', '.navigation-item', function (event) {
			var nameDiv = $(this).find('.navigation-item-name').trigger('click');
			event.preventDefault();
			event.stopPropagation();
			navClickHandler(nameDiv);
			return false;
		});

	})
}

FSBL.addEventListener('onReady', function () {

		console.log("Mark Force Day Theme");
		// Force light/day theme
		const themeWatcher = setInterval(() => {
			const newClasses = document.body.className.replace('dark', 'light')
			if (newClasses !== document.body.className) {
				document.body.className = newClasses
				clearInterval(themeWatcher)
			}
		}, 1000)

		if (window.mindControl) {
			console.warn('Duplicate Injection');
			return;
		}
		// Sometimes symphony scrolls the page when clicking on a user, causing the FSBL header to become inoperable (hidden underneath the body)
		// This logic detects such scroll events and snaps back to unscrolled.
		window.onscroll = function () {
			var scroll = $(document).scrollTop();
			if (scroll!==0) {
				window.scrollTo(0, 0);
			}
		};
		window.mindControl = true;
		readyFn();
});
