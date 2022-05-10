
function runPreload() {
    fdc3.addContextListener("customer", (context) => {
        window.displayCustomer(context.customer);
        });
}

// this code ensures that the FSBL library has been initialized
if (window.FSBL && FSBL.addEventListener) {
    FSBL.addEventListener("onReady", runPreload);
} else {
    window.addEventListener("FSBLReady", runPreload);
}
