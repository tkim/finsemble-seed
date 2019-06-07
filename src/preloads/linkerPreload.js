// === Chapter 3 - Preload ===
function alertMe() {
  window.alert(
    "Well, hot dog!"
  )
}

//=== Chapter 4 - Linker ===
function createLinkage() {
  // subscribe to changes on to the topic called account
  // these changes will be reflected when using the same linker channel as
  // accountList and accountDetail
  FSBL.Clients.LinkerClient.subscribe("account", function (obj) {
    displayAccount(obj);
  });
}

// uncomment the functions below for each section
function selectedPreload() {
  // alertMe()
  // createLinkage()
}

// make sure that the FSBL library has been initialized
if (window.FSBL && FSBL.addEventListener) {
  FSBL.addEventListener("onReady", selectedPreload);
} else {
  window.addEventListener("FSBLReady", selectedPreload);
}
