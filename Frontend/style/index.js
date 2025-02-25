document.addEventListener("DOMContentLoaded", function () {
    const signInButton = document.getElementById("signInButton");
    const discoverButton = document.getElementById("btn");
    const container = document.querySelector(".container");
    const overlay = document.createElement("div"); 
    overlay.classList.add("overlay");
    document.body.appendChild(overlay);

    signInButton.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default link action
        showForm("login");
    });

    discoverButton.addEventListener("click", function (event) {
        event.preventDefault();
        showForm("register");
    });

    overlay.addEventListener("click", function () {
        container.style.display = "none";
        overlay.style.display = "none";
    });
});

function showForm(type) {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (type === "login") {
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
    } else if (type === "register") {
        registerForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
    }

    document.querySelector(".container").style.display = "block";
    document.querySelector(".overlay").style.display = "block";
}




function toggleMenu() {
    document.querySelector(".nav-container").classList.toggle("active");
}

