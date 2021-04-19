function runPreload() {

    // Apps with windowTitlebars have a browserView
    const browserView = fin.desktop.System.currentWindow.getBrowserView();

    const openDevTools = () => {
        if (browserView) {
            browserView.webContents.openDevTools();
        } else {
            fin.desktop.System.currentWindow.openDevTools()
        }
    }

    let appOrServiceWindow

    // Check to see if we are working in a component with a titlebar OR no titlebar / service
    if (browserView) {
        // component with titlebar
        appOrServiceWindow = browserView.webContents
    } else {
        // service or component without titlebar
        appOrServiceWindow = fin.desktop.System.currentWindow
    }


    // event listeners for the devtools
    // appOrServiceWindow.addListener("devtools-opened", () => console.log("devtools-opened"))
    // appOrServiceWindow.addListener("devtools-closed", () => console.log("devtools-closed"))

    function toggleDevTools() {
        const state = FSBL.Clients.WindowClient.getComponentState
            ({ field: 'devToolsOpen' }, console.log)
        console.log(state)

        let devToolsOpen = appOrServiceWindow.isDevToolsOpened();
        console.log(`DevTools Is open ${devToolsOpen}`)
        if (devToolsOpen) {
            appOrServiceWindow.closeDevTools()
        } else {
            console.log("DevTools is opening")
            appOrServiceWindow.openDevTools()
        }
        FSBL.Clients.WindowClient.setComponentState({ field: 'devToolsOpen', value: devToolsOpen });

    }

    // === UI Section ===

    // make the devtools button
    let devToolsDiv = document.createElement("div");
    devToolsDiv.innerHTML = `
    <button id="devtools">Open DevTools</button>`

    document.body.children[0].prepend(devToolsDiv)


    // open the devtools via button click
    document.body.addEventListener('click', (event) => {
        if (event.target.id == 'devtools') {
            toggleDevTools()
        };
    });
}



// this code ensures that the FSBL library has been initialized
if (window.FSBL && FSBL.addEventListener) {
    FSBL.addEventListener("onReady", runPreload);
} else {
    window.addEventListener("FSBLReady", runPreload);
}

