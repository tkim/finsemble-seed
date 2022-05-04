
function runPreload() {
// add your code or functions here and it will be executed
// as soon as the preload is added
}

// this code ensures that the FSBL library has been initialized
if (window.FSBL && FSBL.addEventListener) {
    FSBL.addEventListener("onReady", runPreload);
} else {
    window.addEventListener("FSBLReady", runPreload);
}
