document.addEventListener("DOMContentLoaded", function () {
    const signInButton = document.getElementById("signInButton");
    const container = document.querySelector(".container");
    const overlay = document.createElement("div"); 
    overlay.classList.add("overlay");
    document.body.appendChild(overlay);

    signInButton.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default link action
        container.style.display = "block";
        overlay.style.display = "block";
    });

    overlay.addEventListener("click", function () {
        container.style.display = "none";
        overlay.style.display = "none";
    });
});

function toggleMenu() {
    document.querySelector(".nav-container").classList.toggle("active");
}

