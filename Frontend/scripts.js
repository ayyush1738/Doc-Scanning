document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("new-username").value;
    const password = document.getElementById("new-password").value;
    const role = document.getElementById("register-role").value;

    const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 👈 Add this
        body: JSON.stringify({ username, password, role })
    });

    const data = await response.text();
    alert(data);
});


document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 👈 Add this
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    
    if (data.message === "Login successful") {
        if (data.user.role === "admin") {
            window.location.href = "http://127.0.0.1:5500/dashboard.html"; // Redirect to admin dashboard
        } else if (data.user.role === "user") {
            window.location.href = "http://127.0.0.1:5500/user.html";
        }
    } else {
        alert(data.message);
    }
});


