// function alertMe() {
//   window.alert(
//     "Well, hot dog!"
//   )
// }

const updateLinker = () => {
  FSBL.Clients.LinkerClient.publish({ dataType: "account", data: customer.acc });
}


function runPreload() {
  updateLinker()
}

if (window.FSBL && FSBL.addEventListener) {
  FSBL.addEventListener("onReady", runPreload);
} else {
  window.addEventListener("FSBLReady", runPreload);
}
