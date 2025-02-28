document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("http://localhost:3000/admin/analytics");
    const data = await response.json();
    let count = 0;

    document.getElementById("total-scans").innerText = data.total_scans_today;
    document.getElementById("top-topics").innerHTML = data.top_topics
        .map((topic, index) => {
            return `<span class="${index < 3 ? "highlight-topic" : ""}">${count = count + 1}${'. '} ${topic}</span>`;
        })
        .join("<br><br>");

    createDoughnutChart(data.top_users);
    createBarChart(data.top_credits);

    const tableBody = document.getElementById("user-scans-table").querySelector("tbody");
    tableBody.innerHTML = ""; 

    if (data.user_scans.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No Data Available At Present</td></tr>`;
    } else {
        data.user_scans.forEach(user => {
            let row = `<tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.scans_today}</td>
                <td>${user.total_scans}</td>
                <td>${user.credits}</td>
                <td>${user.pending_requests}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    }

    const tableBody2 = document.getElementById("credit-scans-table").querySelector("tbody");
    tableBody2.innerHTML = ""; 

    if (data.credits_used.length === 0) {
        tableBody2.innerHTML = `<tr><td colspan="3" style="text-align:center;">No Data Available At Present</td></tr>`;
    } else {
        data.credits_used.forEach(user => {
            let row = `<tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.credits_used}</td>
            </tr>`;
            tableBody2.innerHTML += row;
        });
    }

    showPage(1);
});



function showPage(pageNumber) {
    document.querySelectorAll(".page").forEach(page => page.classList.remove("active-page"));
    document.getElementById(`page${pageNumber}`).classList.add("active-page");

    document.querySelectorAll(".sidebar a").forEach(link => link.classList.remove("active"));
    document.querySelectorAll(".sidebar a")[pageNumber - 1].classList.add("active");
}

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
                        display: false 
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 0.5
                    },
                    grid: {
                        display: false 
                    }
                }
            },
            plugins: {
                legend: {
                    display: false 
                }
            }
        }
    });
}


function filterScansTable() {
    let input = document.getElementById("searchUser").value.toLowerCase();
    let table = document.getElementById("user-scans-table");
    let rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) { 
        let usernameCell = rows[i].getElementsByTagName("td")[0]; 
        if (usernameCell) {
            let username = usernameCell.textContent || usernameCell.innerText;
            if (username.toLowerCase().includes(input)) {
                rows[i].style.display = ""; 
            } else {
                rows[i].style.display = "none"; 
            }
        }
    }
}

function filterCreditsTable() {
    let input = document.getElementById("searchCreditsUser").value.toLowerCase();
    let table = document.getElementById("credit-scans-table");
    let rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) { 
        let usernameCell = rows[i].getElementsByTagName("td")[0]; 
        if (usernameCell) {
            let username = usernameCell.textContent || usernameCell.innerText;
            if (username.toLowerCase().includes(input)) {
                rows[i].style.display = ""; 
            } else {
                rows[i].style.display = "none"; 
            }
        }
    }
}


function approveCredit(requestId) {
    fetch("/admin/approve-credit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ requestId })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        fetchCreditRequests();  
    })
    .catch(error => console.error("Error approving credit:", error));
}

function denyCredit(requestId) {
    fetch("/admin/deny-credit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ requestId })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        fetchCreditRequests();  
    })
    .catch(error => console.error("Error denying credit:", error));
}


function fetchScansPerUser() {
    fetch("/admin/analytics")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("user-scans-table").querySelector("tbody");
            tableBody.innerHTML = ""; 

            data.user_scans.forEach(user => {
                let row = `<tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.scans_today}</td>
                    <td>${user.total_scans}</td>
                    <td id="credits-${user.id}">${user.credits}</td>
                    <td>
                        <button onclick="updateCredits(${user.id}, 1)">➕</button>
                        <button onclick="updateCredits(${user.id}, -1)">➖</button>
                    </td>
                </tr>`;

                tableBody.innerHTML += row;
            });
        })
        .catch(error => console.error("Error fetching scans per user:", error));
}

function updateCredits(userId, amount) {
    fetch("/admin/update-credits", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, amount })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            let creditsElement = document.getElementById(`credits-${userId}`);
            creditsElement.textContent = parseInt(creditsElement.textContent) + amount;
        }
        alert(data.message);
    })
    .catch(error => console.error("Error updating credits:", error));
}


document.addEventListener("DOMContentLoaded", fetchScansPerUser);


function approveCredit(requestId, username, credits) {
    fetch("/admin/approve-credit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ requestId })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        moveToProcessedTable(requestId, username, credits, "Approved");
        fetchCreditRequests();  
    })
    .catch(error => console.error("Error approving credit:", error));
}

function denyCredit(requestId, username, credits) {
    fetch("/admin/deny-credit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ requestId })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        moveToProcessedTable(requestId, username, credits, "Denied");
        fetchCreditRequests();  
    })
    .catch(error => console.error("Error denying credit:", error));
}

function moveToProcessedTable(requestId, username, credits, status) {
    const processedTableBody = document.getElementById("processed-credit-requests").querySelector("tbody");

    let row = `<tr>
        <td>${requestId}</td>
        <td>${username}</td>
        <td>${credits}</td>
        <td>${status}</td>
    </tr>`;

    processedTableBody.innerHTML += row;
}


document.addEventListener("DOMContentLoaded", fetchCreditRequests);

function fetchActivityLogs() {
    fetch("/admin/activity-logs")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("activity-logs-table").querySelector("tbody");
            tableBody.innerHTML = ""; 

            data.logs.forEach(log => {
                let row = `<tr>
                    <td>${new Date(log.timestamp).toLocaleString()}</td>
                    <td>${log.username}</td>
                    <td>${log.action}</td>
                    <td>${log.details}</td>
                </tr>`;

                tableBody.innerHTML += row;
            });
        })
        .catch(error => console.error("Error fetching activity logs:", error));
}

function filterActivityTable() {
    let input = document.getElementById("searchActivity").value.toLowerCase();
    let table = document.getElementById("activity-logs-table");
    let rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) { 
        let usernameCell = rows[i].getElementsByTagName("td")[1]; 
        if (usernameCell) {
            let username = usernameCell.textContent || usernameCell.innerText;
            if (username.toLowerCase().includes(input)) {
                rows[i].style.display = ""; 
            } else {
                rows[i].style.display = "none"; 
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", fetchActivityLogs);

function fetchCreditRequests() {
    fetch("/admin/credit-requests")
        .then(response => response.json())
        .then(data => {
            const pendingTableBody = document.getElementById("pending-credit-requests").querySelector("tbody");
            pendingTableBody.innerHTML = ""; 

            data.requests.forEach(request => {
                let row = `<tr>
                    <td>${request.id}</td>
                    <td>${request.username}</td>
                    <td>${request.requested_credits}</td>
                    <td>
                        <button class="approve-btn" onclick="approveCredit(${request.id}, '${request.username}', ${request.requested_credits})">Approve</button>
                        <button class="deny-btn" onclick="denyCredit(${request.id}, '${request.username}', ${request.requested_credits})">Deny</button>
                    </td>
                </tr>`;

                pendingTableBody.innerHTML += row;
            });
        })
        .catch(error => console.error("Error fetching credit requests:", error));
}



function logout() {
    fetch("/auth/logout", {
        method: "POST",
        credentials: "include"
    }).then(() => {
        window.location.href = "index.html";  
    }).catch(error => console.error("Logout error:", error));
}

