
if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener('onReady', init);
} else {
	window.addEventListener('FSBLReady', init);
}

function init() {
	const dialogButton = document.getElementById("dialogButton");
	dialogButton.addEventListener('click', openDialog)
}


function openDialog() {

	const dialogParams = {
		question: 'Would you like to execute this trade?',
		affirmativeResponseText: 'Yes, buy',
		negativeResponseText: 'No, cancel',
		includeNegative: true,
		includeCancel: false
	};
	FSBL.Clients.DialogManager.open('yesNo', dialogParams, function (err, response) {
		//choice can be `'affirmative'`, `'negative'`, or `'cancel'`.
		if (response.choice === 'affirmative') {
			// add your function here
			console.log('trade executed')
		}
		if (response.choice === 'negative') {
			// add your function here
			console.log('trade cancelled')
		}
	});
}