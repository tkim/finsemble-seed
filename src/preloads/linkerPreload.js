function alertMe() {
  window.alert(
    "Well, hot dog!"
  )
}

if (window.FSBL && FSBL.addEventListener) {
  FSBL.addEventListener("onReady", alertMe);
} else {
  window.addEventListener("FSBLReady", alertMe);
}