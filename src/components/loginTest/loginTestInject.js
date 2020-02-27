//Enter and send credentials
function enterCredentials(){
    document.getElementById('username').value = "test";
    document.getElementById('password').value = "asecurepassword";
    document.getElementById('login').click();
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}

//Launch test
function FSBLReady() {
	enterCredentials();
}