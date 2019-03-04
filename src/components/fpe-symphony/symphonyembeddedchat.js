
console.log('SymphonyChat MindControl: loaded');

FSBL.$ = require('./jQuery.js');

if (location.href.includes('/client/index')) {
	location.href = location.href.replace('/client/', '/embed/')
}

FSBL.plugins = {
	sendData: function (data) {
		if (!FSBL.preloadPlugins) return;
		FSBL.preloadPlugins.forEach(function (e) {
			e.sendData(data);
		});
	},
	publish: function (chatDescriptor) {
		if (!FSBL.preloadPlugins) return;
		FSBL.preloadPlugins.forEach(function (e) {
			e.publish(chatDescriptor);
		});
	}
};

FSBL.preloadPlugins = [];

FSBL.addEventListener('onReady', function (event) {

	var componentConfig = FSBL.Clients.WindowClient.options.customData.component;
	var podURL = componentConfig.podURL;
	if (podURL.slice(-1) == "/") podURL = podURL.slice(0, -1); // trim off any trailing slashes
	let symphonyURL = podURL + "/client/index.html?embed&" + componentConfig.queryStringParams + "&";
	symphonyURL += "sdkOrigin=" + podURL + "&";
	var restURL = componentConfig.restURL;

	FSBL.Clients.Logger.system.info(`SymphonyChat MindControl: starting.`);

	FSBL.Clients.ConfigClient.getValue({ field: 'finsemble.applicationRoot' }, function (err, value) {
		FSBL.applicationRoot = value;
		if (!restURL) restURL = FSBL.applicationRoot;
	});

	if (window.mindControl) {
		console.warn('Duplicate Injection');
		return;
	}
	window.mindControl = true;

	if (location.href.includes(podURL)) {
		FSBL.Clients.WindowClient.injectHeader();
	}
	FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl: creating store.`, FSBL.Clients.WindowClient.windowName);
	FSBL.Clients.DistributedStoreClient.createStore({
		store: "Symphony", global: true, values: {
			'primarySymphonyWindow': FSBL.Clients.WindowClient.windowName
		}
	}, function (err, globalStore) {

		FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl: creating store response.`, err);

		// Style Overrides
		FSBL.$(document.body).append(`<style>
		.module.chat-module.single-party {
			height: calc(100vh - 32px);
		}
		</style>`);


		function processSharedData(sharedData) {
			FSBL.Clients.DragAndDropClient.openSharedData({ data: sharedData });
		}

		function hijackEventDispatcher() {
			console.log('hijacking event dispatcher');
			document.addEventListener('click', function (e) {
				if (e.target.tagName == "SPAN" && e.target.parentElement.tagName == "A") {
					var link = e.target.parentElement.href;
					if (link.indexOf('finsemble//') !== -1) {
						e.stopPropagation();
						e.preventDefault();
						var data = link.split('finsemble//')[1];
						processSharedData(JSON.parse(decodeURIComponent(data)));
					}
				}
			}, true);

			document.addEventListener('dragstart', function (e) {
				console.log(e);
				if (e.target.tagName == "A") {
					var link = e.target.href;
					if (link.indexOf('finsemble//') !== -1) {
						var data = link.split('finsemble//')[1];
						data = JSON.parse(decodeURIComponent(data));
						FSBL.Clients.DragAndDropClient.dragStartWithData(e, data);
					}
				}
			}, true);

		}

		// function doStuffAfterLoggingIn(cb) {
		// 		// Force light/day theme
		// 		document.body.className = document.body.className.replace('dark', 'light');
		// 		hijackEventDispatcher();

		// 		return cb(false);
		// }


		/**
		 * Make a url safe streamID according to https://rest-api.symphony.com/docs/room-id
		 * @param {string} streamID the stream ID (room)
		 */
		function symphonyEncode(streamID) {
			function escapeRegExp(str) {
				return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
			}
			function replaceAll(str, find, replace) {
				return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
			}
			streamID = replaceAll(streamID, "+", "-");
			streamID = replaceAll(streamID, "/", "_");
			streamID = streamID.replace("==", "");
			return streamID;
		}
		/**
		 * Changes this window's location to display embedded chat for the requested chat information object
		 * @param {object} chatInfo That chat information object passed from the main Symphony component
		 */
		function changeChatLocation(chatInfo) {
			var additionalQueryString = chatInfo.userID ? 'module=im&userIds=' + chatInfo.userID : 'module=room&streamId=' + symphonyEncode(chatInfo.viewID);
			FSBL.Clients.Logger.system.debug(`Finsemble.SymphonySignedOn:reload`, additionalQueryString);
			location.href = symphonyURL + additionalQueryString;
		}

		FSBL.$(document.body).append('<style>'+require('./symphonyembeddedchat.css')+'</style>');
		// doStuffAfterLoggingIn(cb);

		// Get state at load time

		FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl: before getComponentState`);
		FSBL.Clients.WindowClient.getComponentState({ field: 'chatInfo' }, function (err, state) {
			FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl:getComponentState`, state);
			if (state) { FSBL.Clients.WindowClient.options.customData.chatInfo = state; }
			// set state to be used at reload time
			FSBL.Clients.WindowClient.setComponentState({ field: 'chatInfo', value: FSBL.Clients.WindowClient.options.customData.chatInfo });
			if (FSBL.Clients.WindowClient.options.customData.chatInfo) {
				var chatDescriptor = FSBL.Clients.WindowClient.options.customData.chatInfo;
				var chatId = chatDescriptor.userID ? chatDescriptor.userID : chatDescriptor.viewID;
				//globalStore.setValue({ field: 'chats.' + chatId + '.' + FSBL.Clients.WindowClient.windowName, value: true });
				FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl X: before getGroups`);
				if (FSBL.Clients.LinkerClient.getGroups().groups.length && chatDescriptor.userID) {
					FSBL.plugins.publish(chatDescriptor);
				}
				if (chatDescriptor.header) {
					FSBL.Clients.WindowClient.setWindowTitle(chatDescriptor.header + " | Symphony");
				}

				changeChatLocation(chatDescriptor);
			}

			// Hijack the event dispatcher to catch finsemble// links
			// doStuffAfterLoggingIn(cb);
			hijackEventDispatcher();
			
			function sendData(err, response) {
				if (response.shareMethod != FSBL.Clients.DragAndDropClient.SHARE_METHOD.DROP) {
					return;
				}
				var data = response.data;
				if (data['symphony.chat']) {
					delete data['symphony.chat'];
				}
				if (!Object.keys(data).length) return;

				var chatInfo = FSBL.Clients.WindowClient.options.customData.chatInfo;

				encodedMessage = encodeURIComponent(JSON.stringify(response.data));
				var url = new URL("https://finsemble//" + encodedMessage);
				messageKeys = Object.keys(response.data);
				var title = response.data[messageKeys[0]].description;
				for (var i = 1; i < messageKeys.length; i++) {
					title += ' and ' + response.data[messageKeys[i]].description;
				}
				var messageML = '<messageML><a href="' + url.href + '">' + title + '</a></messageML>';

				FSBL.$.ajax({
					url: restURL + '/sendSymphonyMessage',
					method: 'post',
					data: {
						senderId: chatInfo.fromUser.id,
						receiverId: chatInfo.userID,
						message: messageML
					}
				}).done(function (response) {
				})

				FSBL.plugins.sendData(data);
			}

			function _openChat(chatInfo) {
				FSBL.Clients.WindowClient.options.customData.chatInfo = chatInfo; // replace same window with a new user
				FSBL.Clients.WindowClient.setComponentState({ field: 'chatInfo', value: chatInfo }, function () {
					changeChatLocation(chatInfo);
				});
			}

			function openChat(err, response) {
				if (FSBL.Clients.WindowClient.options.customData.chatInfo) {
					var chatId = FSBL.Clients.WindowClient.options.customData.chatInfo.userID ? FSBL.Clients.WindowClient.options.customData.chatInfo.userID : FSBL.Clients.WindowClient.options.customData.chatInfo.viewID;
					globalStore.removeValue({ field: 'chats.' + chatId + '.' + FSBL.Clients.WindowClient.windowName });
				}

				var chatData = response.data['symphony.chat'].chatDescriptor;
				if (chatData.userName) { // this is for the salesforce connector
					chatData.fromUser = FSBL.Clients.WindowClient.options.customData.chatInfo.fromUser;
					// find User
					FSBL.$.ajax({
						url: restURL + '/getUserByName',
						method: 'POST',
						data: {
							senderId: FSBL.Clients.WindowClient.options.customData.chatInfo.fromUser.id,
							userName: chatData.userName
						}
					}).done(function (response) {
						chatData.userID = response.id;
						_openChat(chatData);

					})
				} else {
					_openChat(chatData);
				}
			}

			//FSBL.Clients.DragAndDropClient.openLinkerDataByDefault = false;
			console.log('Adding Receivers');
			FSBL.Clients.DragAndDropClient.addReceivers({
				receivers: [
					{
						type: /.*/,
						handler: sendData
					},
					{
						type: 'symphony.chat',
						handler: openChat
					}
				]
			});

			window.addEventListener("beforeunload", function (event) {
				FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl:beforeunload`, event);
				var chatId = FSBL.Clients.WindowClient.options.customData.chatInfo.userID ? FSBL.Clients.WindowClient.options.customData.chatInfo.userID : FSBL.Clients.WindowClient.options.customData.chatInfo.viewID;
				globalStore.removeValue({ field: 'chats.' + chatId + '.' + FSBL.Clients.WindowClient.windowName });
			});

		});
	})
});
