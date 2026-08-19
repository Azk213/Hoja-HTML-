function validateLogin(){
    let email  = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let valid = true;

    if (!email.includes("@")){
        document.getElementById("emailError").textContent = "Invalid email";
        valid = false;
    }

    if(password.length < 6) {
        document.getElementById("passwordError").textContent = "Invalid password";
        valid = false;
    }

    if(valid) {
        alert("Login Successful")
    }

    return false;
}

function togglePassword(){
    let pass = document.getElementById("password")
    pass.type = pass.type === "password" ? "text" : "password";
}

function showOTP(){
    document.getElementById("otpbox").classList.remove("hidden");
}

function verifyOTP() {
    let otp = document.getElementById("otp").value;

    if (otp === "123456") {
        alert ("OTP Verified")
    } else{
        alert("Invalid OTP")
    }
    
}

function toggleMode(){
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light")
}