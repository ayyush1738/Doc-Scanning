document.addEventListener("DOMContentLoaded", async () => {
    // Add event listeners only if the forms exist
    const registerForm = document.getElementById("register-form");
    if (registerForm) registerForm.addEventListener("submit", registerUser);

    const loginForm = document.getElementById("login-form");
    if (loginForm) loginForm.addEventListener("submit", loginUser);

    const uploadForm = document.getElementById("upload-form");
    if (uploadForm) uploadForm.addEventListener("submit", uploadDocument);

    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get("username");

    if (username) {
        await checkUserRole(username);
    }
});

/**
 * Register a new user
 */
async function registerUser(e) {
    e.preventDefault();
    const username = document.getElementById("new-username").value;
    const password = document.getElementById("new-password").value;
    const role = document.getElementById("register-role").value;

    try {
        const response = await fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, password, role })
        });

        const data = await response.text();
        alert(data);
    } catch (error) {
        console.error("Error registering user:", error);
    }
}

/**
 * Login user and redirect based on role
 */
async function loginUser(e) {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.message === "Login successful") {
            window.location.href = data.user.role === "admin" ? "dashboard.html" : `user.html?username=${username}`;
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error logging in:", error);
    }
}

/**
 * Check user role and redirect if unauthorized
 */
async function checkUserRole(username) {
    try {
        const response = await fetch("http://localhost:3000/auth/checkRole", {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });

        if (response.status === 401) {
            alert("Session expired! Please log in again.");
            window.location.href = "index.html";
            return;
        }

        const data = await response.json();
        if (data.role !== "user") {
            alert("Unauthorized Access! Redirecting...");
            window.location.href = "index.html";
        } else {
            await showProfile(username);
        }
    } catch (error) {
        console.error("Error checking user role:", error);
    }
}

/**
 * Fetch and display user profile details
 */
async function showProfile(username) {
    try {
        const response = await fetch(`http://localhost:3000/user/regularUser?username=${username}`);
        const profile = await response.json();

        const profileContainer = document.getElementById("profileContainer");
        if (!profileContainer) return;

        profileContainer.innerHTML = `
            <h1>Welcome, ${profile.username}</h1>
            <p>Credits: ${profile.role === 'admin' ? 'Unlimited' : profile.credits} | Role: ${profile.role}</p>
            <h2>Past Scans</h2>
            <ul id="pastScansList"></ul>
        `;

        const pastScansList = document.getElementById("pastScansList");
        profile.pastScans.forEach(doc => {
            const li = document.createElement("li");
            li.innerHTML = `${doc.filename} (${doc.upload_date}) 
                <button onclick="findMatches(${doc.id}, '${username}')">Find Matches</button>`;
            pastScansList.appendChild(li);
        });

        // Show credit request section for regular users
        if (profile.role === 'user') {
            document.getElementById("creditRequestSection").style.display = "block";
            document.getElementById("requestCreditsBtn").onclick = () => requestCredits(username);
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
}

/**
 * Upload document for scanning
 */
async function uploadDocument(e) {
    e.preventDefault();

    const fileInput = document.getElementById("file-input").files[0];
    if (!fileInput) {
        alert("Please select a file!");
        return;
    }

    const formData = new FormData();
    formData.append("document", fileInput);

    try {
        const response = await fetch("http://localhost:3000/user/regularUser/upload", {
            method: "POST",
            body: formData,
            credentials: "include"
        });

        const data = await response.json();
        const matchList = document.getElementById("matches");

        matchList.innerHTML = data.matches.length > 0
            ? data.matches.map(match => `<li>Match: ${match.filename} - Score: ${match.score}</li>`).join('')
            : "<li>No matching documents found.</li>";
    } catch (error) {
        console.error("Error uploading document:", error);
    }
}

/**
 * Find matches for a scanned document
 */
async function findMatches(docId, username) {
    try {
        const response = await fetch(`http://localhost:3000/user/matches?docId=${docId}&username=${username}`);
        const data = await response.json();

        alert(data.matches.length > 0 ? `Found ${data.matches.length} matches!` : "No matches found.");
    } catch (error) {
        console.error("Error finding matches:", error);
    }
}

/**
 * Request credits for the user
 */
async function requestCredits(username) {
    const creditAmount = document.getElementById("creditAmount").value;
    if (!creditAmount || creditAmount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/user/requestCredits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, amount: creditAmount }),
            credentials: "include"
        });

        const result = await response.json();
        alert(result.message || "Credit request submitted!");
    } catch (error) {
        console.error("Error requesting credits:", error);
    }
}
