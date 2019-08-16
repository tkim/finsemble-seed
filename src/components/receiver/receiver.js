if (window.FSBL && FSBL.addEventListener) {
    FSBL.addEventListener('onReady', init);
} else {
    window.addEventListener('FSBLReady', init);
}

function init() {
    FSBL.Clients.DragAndDropClient.addReceivers({
        receivers: [
            {
                type: 'sender.receiver',
                handler: getSharedData
            },
            {
                type: "symphony.chat",
                handler: whatTheChat
            }
        ]
    });

    FSBL.Clients.LinkerClient.subscribe("Finsemble.DragAndDropClient", function(data){
        // alert("Data from Linker", data);
    });
}
function whatTheChat(err, data) {

    // alert("whatTheChat", err, data)
}

function getSharedData(err, data) {
    let dest = "";
    switch (data.data['sender.receiver']['key']) {
        case "welcome":
            dest = "http://localhost:3375/components/welcome/welcome.html";
            break;
        case "blank":
            dest = "about:blank";
            break;
        case "google":
            dest = "https://www.google.com";
            break;
        case "bing":
            dest = "https://www.bing.com";
            break;
        // case "symphony":
        //     dest = "https://chartiq.symphony.com/embed/index.html?condensed=true&contrast=true&mode=dark&module=im&sdkOrigin=https://chartiq.symphony.com&showAttach=true&showCompose=true&showDisableInput=false&showEmoji=true&showInfo=true&showSystemMessages=true&showTitle=true&showXPod=true&userIds=76072460746777";
        //     break;

    }

    if (dest) {
        location.href = dest;
    }

    // alert("getSharedData");
    // document.getElementById("receivedValue").textContent = data.data['sender.receiver']['key'];
}
