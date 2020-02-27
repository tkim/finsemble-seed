function login(){
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let validUser = true;
    if (username != "test" || password != "asecurepassword"){
        validUser = false;
    }
    if (validUser){
        window.location.href = "loginTestSuccess.html"
    }
    else{
        window.alert("Invalid username or password");
    }
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}