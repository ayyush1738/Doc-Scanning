document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("/admin/analytics");
    const data = await response.json();

    // Update Page 1: Total Scans Today
    document.getElementById("total-scans").innerText = data.total_scans_today;
    document.getElementById("top-topics").innerHTML = data.top_topics
    .map((topic, index) => {
        if (index < 3) {
            return `<span class="highlight-topic">${topic}</span>`; // Highlight top 3
        } else {
            return `<span>${topic}</span>`; // Normal text for the rest
        }
    })
    .join("<br><br>");


    // Update Page 2: Top Users by Scans (Circular Graph)
    createDoughnutChart(data.top_users);

    // Update Page 3: Credit Usage Stats (Bar Graph)
    createBarChart(data.credits_used);

    // Update Page 4: Scans per User Table
    const tableBody = document.getElementById("user-scans-table").querySelector("tbody");
    tableBody.innerHTML = "";
    data.user_scans.forEach(user => {
        let row = `<tr>
            <td>${user.username}</td>
            <td>${user.scans_today}</td>
            <td>${user.total_scans}</td>
            <td>${user.credits}</td>
        </tr>`;
        tableBody.innerHTML += row;
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
                backgroundColor: ["#007bff", "#28a745", "#ff5733", "#ffc107", "#6c757d"]
            }]
        }
    });
}


function createBarChart(topUsers) {
    const ctx = document.getElementById("creditChart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: topUsers.map(user => user.username),
            datasets: [{
                label: "Credits Used",
                data: topUsers.map(user => user.credits_used || 0),
                backgroundColor: "rgba(75, 192, 192, 0.5)"
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 2 // Ensures scale increments by 5
                    }
                }
            }
        }
    });
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


