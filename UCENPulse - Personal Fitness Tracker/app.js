/* ============================================================
   UCENPulse – Personal Fitness Tracker
   Handles:
   - Activity Logging
   - Daily Metrics
   - LocalStorage
   - Charts (Activity + Metrics)
   - Recent Activity List
   - Range Filters
============================================================ */

//helpers
const getStored = (key) => JSON.parse(localStorage.getItem(key)) || [];
const saveStored = (key, data) => localStorage.setItem(key, JSON.stringify(data));

//DOM Elements
const activityForm = document.getElementById("activity-form");
const  metricsForm = document.getElementById("metrics-form");

const recentList = document.getElementById("recent-list");
const activityStatus = document.getElementById("activity-status");
const metricStatus = document.getElementById("metric-status");

const rangeButtons = document.querySelectorAll("[data-range]");

let activityChart;
let metricsChart;

//Activity Logging
activityForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const activityType = document.querySelector("input[name='activityType']:checked")?.value;
    const duration = document.getElementById("duration").value.trim();
    const notes = document.getElementById("activity-notes").value.trim();

    if (!activityForm || !duration) {
        activityStatus.textContent = "please fill in all required fields";
        return;
    }

    const newEntry = {
        type: activityType,
        duration: Number(duration),
        notes,
        date: new Date().toISOString()
    };

    const activities = getStored("activities");
    activities.push(newEntry);
    saveStored("activities", activities);

    activityStatus.textContent = "Activities added!";
    activityForm.reset();
    updateRecentActivity();
    updateActivityChart();
});

//Health Metrics Logging
metricsForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const entry = {
        steps: Numbers(document.getElementById("steps").value) || 0,
        water: Numbers(document.getElementById("water").value) || 0,
        sleep: Numbers(document.getElementById("sleep").value) || 0,
        calories: Numbers(document.getElementById("calories").value) || 0,
        date: new Date().toISOString()

    };

    const metrics = getStored("metrics");
    metrics.push(entry);
    saveStored("metrics", metrics);

    metricStatus.textContent = "Metrics saved!";
    metricsForm.reset();
    updateMetricChart();
});
//Recent Activity List
function updateRecentActivity() {
    const activities = getStored("activities").slice(-5).reverse(); // Last 5 entries
    recentList.innerHTML = "";

    if (activities.length === 0) {
        recentList.innerHTML = "<li>No activities logged yet.</li>";
        return;
    }

    activities.forEach((act) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${act.type}</strong> – ${act.duration} mins 
            <br><small>${new Date(act.date).toLocaleString()}</small>
        `;
        recentList.appendChild(li);
    });
}

//Range Filtering Utility
function filterByRange(data, days) {
    const now = Date.now();
    const limit = days * 24 * 60 * 60 * 1000;

    return data.filter(item => now - new Date(item.date).getTime() <= limit);
}

let currentRange = 7; // default

rangeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        currentRange = Number(btn.dataset.range);
        updateActivityChart();
        updateMetricChart();
    });
});

//Activity Chart (Duration Over Time)
function updateActivityChart() {
    const activities = filterByRange(getStored("activities"), currentRange);

    const labels = activities.map(a => new Date(a.date).toLocaleDateString());
    const data = activities.map(a => a.duration);

    const ctx = document.getElementById("activityChart");

    if (activityChart) activityChart.destroy();

    activityChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Duration (minutes)",
                data,
                borderWidth: 2
            }]
        }
    });
}