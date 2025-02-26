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

    const requestCreditsBtn = document.getElementById("requestCreditsBtn");
    if (requestCreditsBtn) {
        requestCreditsBtn.addEventListener("click", () => requestCredits(username));
    }

    if (username) {
        await checkUserRole(username);
    }
});

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


// Fetch and display user profile
async function showProfile(username) {
    try {
        const response = await fetch(`http://localhost:3000/user/regularUser?username=${username}`);
        const profile = await response.json();

        if (!profile.pastScans) {
            profile.pastScans = [];
        }

        // Populate user details
        document.getElementById("welcomeMessage").textContent = `Welcome, ${profile.username}`;
        document.getElementById("userDetails").textContent = `Remaining Credits: ${profile.role === 'admin' ? 'Unlimited' : profile.credits} | Role: ${profile.role}`;

        // Populate past scans
        const pastScansList = document.getElementById("pastScansList");
        pastScansList.innerHTML = ""; // Clear previous list

        if (profile.pastScans.length > 0) {
            profile.pastScans.forEach(doc => {
                const listItem = document.createElement("li");
                listItem.textContent = `${doc.filename} (${doc.upload_date}) `;

                const button = document.createElement("button");
                button.textContent = "Find Matches";
                listItem.classList.add("list-items")
                button.classList.add("findMatchesBtn"); // Assigning class
                button.onclick = () => findMatches(doc.id, username);

                listItem.appendChild(button);
                pastScansList.appendChild(listItem);
            });
        } else {
            const emptyItem = document.createElement("li");
            emptyItem.textContent = "No past scans available.";
            pastScansList.appendChild(emptyItem);
        }

        // Show credit request section for regular users
        if (profile.role === 'user') {
            document.getElementById("creditRequestSection").style.display = "block";
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



async function requestCredits(username) {
    const creditAmount = parseInt(document.getElementById("creditAmount").value);

    if (!creditAmount || creditAmount <= 0) {
        alert("Please enter a valid credit amount.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/user/regularUser/requestCredits", {
            method: "POST",  // Ensure it matches backend route type
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, requested_credits: creditAmount }),
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();
        alert(result.message || "Credit request submitted successfully!");
    } catch (error) {
        console.error("Error requesting credits:", error);
        alert("Failed to request credits. Please try again.");
    }
}


