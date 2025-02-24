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

        if (!profile.pastScans) {
            profile.pastScans = []; // ✅ Ensure pastScans is always an array
        }

        const profileContainer = document.getElementById("profileContainer");
        if (!profileContainer) return;

        profileContainer.innerHTML = `
            <h1>Welcome, ${profile.username}</h1>
            <p>Credits: ${profile.role === 'admin' ? 'Unlimited' : profile.credits} | Role: ${profile.role}</p>
            <h2>Past Scans</h2>
            <ul id="pastScansList">
                ${profile.pastScans.length > 0 ? profile.pastScans.map(doc => `
                    <li>
                        ${doc.filename} (${doc.upload_date}) 
                        <button onclick="findMatches(${doc.id}, '${username}')">Find Matches</button>
                    </li>
                `).join('') : "<li>No past scans available.</li>"}
            </ul>
        `;

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

    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get("username");

    const formData = new FormData();
    formData.append("document", fileInput);

    try {
        const response = await fetch("http://localhost:3000/user/regularUser/upload", {
            method: "POST",
            body: formData,
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "File upload failed!");
        }

        alert("File uploaded successfully!");
        await showProfile(username); // ✅ Refresh profile to display uploaded file

    } catch (error) {
        console.error("Error uploading document:", error);
    }
}


/**
 * Find matches for a scanned document
 */
// async function findMatches(docId, username) {
//     try {
//         const data = await response.json();

//         alert(data.matches.length > 0 ? `Found ${data.matches.length} matches!` : "No matches found.");
//     } catch (error) {
//         console.error("Error finding matches:", error);
//     }
// }

async function findMatches(docId, username) {
    console.log(`Attempting to fetch matches for docId: ${docId}, username: ${username}`);

    try {
        const response = await fetch(`http://localhost:3000/user/regularUser/matches/${docId}?username=${username}`, {
            credentials: 'include' // Ensure cookies are sent for authentication
        });

        console.log("Response received:", response); // ✅ Log response

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Match Data:", data); // ✅ Log the returned matches

        if (!data || !Array.isArray(data.matches)) {
            alert("No matches found.");
            return;
        }

        // Display matches in the UI
        const matchesList = document.getElementById("matches");
        if (matchesList) {
            matchesList.innerHTML = data.matches.length > 0
                ? data.matches.map(match => `
                    <li>
                        <strong>${match.filename}</strong> 
                        (Similarity: ${(match.similarity * 100).toFixed(1)}%)
                    </li>
                `).join('')
                : "<li>No matching documents found.</li>";
        }

        alert(`Found ${data.matches.length} matches!`);
    } catch (error) {
        console.error("Error finding matches:", error);
        alert("Error finding matches. Please try again.");
    }
}


/**
 * Request credits for the user
 */
// async function requestCredits(username) {
//     const creditAmount = document.getElementById("creditAmount").value;
//     if (!creditAmount || creditAmount <= 0) {
//         alert("Please enter a valid amount.");
//         return;
//     }

//     try {
//         const response = await fetch("http://localhost:3000/user/requestCredits", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ username, amount: creditAmount }),
//             credentials: "include"
//         });

//         const result = await response.json();
//         alert(result.message || "Credit request submitted!");
//     } catch (error) {
//         console.error("Error requesting credits:", error);
//     }
// }


// document.addEventListener("DOMContentLoaded", async () => {
//     const response = await fetch("http://localhost:3000/auth/checkRole", { credentials: "include" });
//     const data = await response.json();
//     if (data.role !== "admin") window.location.href = "index.html";

//     fetchAnalytics();
//     fetchCreditRequests();
// });

// async function fetchAnalytics() {
//     const response = await fetch("/admin/analytics");
//     const data = await response.json();
//     document.getElementById("total-scans").innerText = data.total_scans_today;
//     document.getElementById("top-topics").innerText = data.top_topics.join(", ");
// }

// async function fetchCreditRequests() {
//     const response = await fetch("/admin/credit-requests");
//     const data = await response.json();
//     const container = document.getElementById("credit-requests");
//     data.requests.forEach(req => {
//         const div = document.createElement("div");
//         div.innerHTML = `${req.username} requested ${req.requested_credits} credits.
//             <button onclick="approve(${req.id})">Approve</button>
//             <button onclick="deny(${req.id})">Deny</button>`;
//         container.appendChild(div);
//     });
// }

// async function approve(requestId) {
//     await fetch("/admin/approve-credit", { method: "POST", body: JSON.stringify({ requestId }), headers: { "Content-Type": "application/json" }});
//     alert("Approved");
//     location.reload();
// }

// async function deny(requestId) {
//     await fetch("/admin/deny-credit", { method: "POST", body: JSON.stringify({ requestId }), headers: { "Content-Type": "application/json" }});
//     alert("Denied");
//     location.reload();
// }
