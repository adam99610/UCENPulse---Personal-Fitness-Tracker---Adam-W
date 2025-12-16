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
