if (window.FSBL && FSBL.addEventListener) {
    FSBL.addEventListener('onReady', init);
} else {
    window.addEventListener('FSBLReady', init);
}

function init() {
    document.getElementById("shared-data").addEventListener("click", () => {
        openSharedData();
    })
}

function openSharedData() {
    console.log("sending");
    FSBL.Clients.DragAndDropClient.openSharedData({
        data: {
            "sender.receiver": {
                "key": document.getElementById("senderValue").value
            }
        }
    });
}
