document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("/admin/analytics");
    const data = await response.json();

    document.getElementById("total-scans").innerText = data.total_scans_today;
    document.getElementById("top-topics").innerHTML = data.top_topics
        .map((topic, index) => {
            return `<span class="${index < 3 ? "highlight-topic" : ""}">${topic}</span>`;
        })
        .join("<br><br>");

    createDoughnutChart(data.top_users);
    createBarChart(data.top_credits);

    // Populate Scans per User Table
const tableBody = document.getElementById("user-scans-table").querySelector("tbody");
tableBody.innerHTML = "";

data.user_scans.forEach(user => {
    let actionButtons = "";
    if (user.pending_requests > 0) {
        actionButtons = `
            <button class="approve-btn" onclick="approveCredit(${user.id})">Approve</button>
            <button class="deny-btn" onclick="denyCredit(${user.id})">Deny</button>
        `;
    }

    let row = `<tr>
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.scans_today}</td>
        <td>${user.total_scans}</td>
        <td>${user.credits}</td>
        <td>${user.pending_requests}</td>
        <td>${actionButtons}</td> 
    </tr>`;
    
    tableBody.innerHTML += row;
});


    // Populate Credit Usage Table
    const tableBody2 = document.getElementById("credit-scans-table").querySelector("tbody");
    tableBody2.innerHTML = "";
    data.credits_used.forEach(user => {
        let row = `<tr>
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.credits_used}</td>
        </tr>`;
        tableBody2.innerHTML += row;
    });

    // Default page load
    showPage(1);
});



// Function to switch between pages
function showPage(pageNumber) {
    document.querySelectorAll(".page").forEach(page => page.classList.remove("active-page"));
    document.getElementById(`page${pageNumber}`).classList.add("active-page");

    // Update active link in the sidebar
    document.querySelectorAll(".sidebar a").forEach(link => link.classList.remove("active"));
    document.querySelectorAll(".sidebar a")[pageNumber - 1].classList.add("active");
}

// Doughnut Chart for Top Users by Scans
function createDoughnutChart(topUsers) {
    const ctx = document.getElementById("topUsersChart").getContext("2d");
    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: topUsers.map(user => user.username),
            datasets: [{
                label: "Scans",
                data: topUsers.map(user => user.total_scans),
                backgroundColor: ["#04fab7", "#ffc733", "#9333ff", "#fc1091", "#6c757d"]
            }]
        }
    });
}


function createBarChart(topCredits) {
    const ctx = document.getElementById("creditChart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: topCredits.map(user => user.username),
            datasets: [{
                label: "Credits Used",
                data: topCredits.map(user => user.top_credits || 0),
                backgroundColor: "rgba(247, 68, 68, 0.75)"

            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    grid: {
                        display: false // Hides vertical grid lines
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 0.5
                    },
                    grid: {
                        display: false // Hides horizontal grid lines
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // Hides the dataset label box
                }
            }
        }
    });
}


// Function to filter table based on search input
function filterScansTable() {
    let input = document.getElementById("searchUser").value.toLowerCase();
    let table = document.getElementById("user-scans-table");
    let rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) { // Start from 1 to skip header row
        let usernameCell = rows[i].getElementsByTagName("td")[0]; // Username is in the first column
        if (usernameCell) {
            let username = usernameCell.textContent || usernameCell.innerText;
            if (username.toLowerCase().includes(input)) {
                rows[i].style.display = ""; // Show matching rows
            } else {
                rows[i].style.display = "none"; // Hide non-matching rows
            }
        }
    }
}

function filterCreditsTable() {
    let input = document.getElementById("searchCreditsUser").value.toLowerCase();
    let table = document.getElementById("credit-scans-table");
    let rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) { // Start from 1 to skip header row
        let usernameCell = rows[i].getElementsByTagName("td")[0]; // Username is in the first column
        if (usernameCell) {
            let username = usernameCell.textContent || usernameCell.innerText;
            if (username.toLowerCase().includes(input)) {
                rows[i].style.display = ""; // Show matching rows
            } else {
                rows[i].style.display = "none"; // Hide non-matching rows
            }
        }
    }
}


// Function to Approve Credit Request
function approveCredit(userId) {
    fetch("/admin/approve-credit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ requestId: userId })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        location.reload(); // Refresh table to reflect changes
    })
    .catch(error => console.error("Error approving credit:", error));
}

// Function to Deny Credit Request
function denyCredit(userId) {
    fetch("/admin/deny-credit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ requestId: userId })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        location.reload(); // Refresh table to reflect changes
    })
    .catch(error => console.error("Error denying credit:", error));
}




// Logout Function
function logout() {
    fetch("/auth/logout", {
        method: "POST",
        credentials: "include"
    }).then(() => {
        window.location.href = "index.html";  // Redirect to login page
    }).catch(error => console.error("Logout error:", error));
}


