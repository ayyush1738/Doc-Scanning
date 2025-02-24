document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("http://localhost:3000/auth/checkRole", { credentials: "include" });
    const data = await response.json();
    if (data.role !== "admin") window.location.href = "index.html";

    fetchAnalytics();
    fetchCreditRequests();
});

async function fetchAnalytics() {
    const response = await fetch("/admin/analytics");
    const data = await response.json();
    document.getElementById("total-scans").innerText = data.total_scans_today;
    document.getElementById("top-topics").innerText = data.top_topics.join(", ");
}

async function fetchCreditRequests() {
    const response = await fetch("/admin/credit-requests");
    const data = await response.json();
    const container = document.getElementById("credit-requests");
    data.requests.forEach(req => {
        const div = document.createElement("div");
        div.innerHTML = `${req.username} requested ${req.requested_credits} credits.
            <button onclick="approve(${req.id})">Approve</button>
            <button onclick="deny(${req.id})">Deny</button>`;
        container.appendChild(div);
    });
}

async function approve(requestId) {
    await fetch("/admin/approve-credit", { method: "POST", body: JSON.stringify({ requestId }), headers: { "Content-Type": "application/json" }});
    alert("Approved");
    location.reload();
}

async function deny(requestId) {
    await fetch("/admin/deny-credit", { method: "POST", body: JSON.stringify({ requestId }), headers: { "Content-Type": "application/json" }});
    alert("Denied");
    location.reload();
}
