/* ============================================================
   UCENPulse – Personal Fitness Tracker
   Client-side JavaScript (ES6+)
============================================================ */

/* -------------------------
   Local Storage Helpers
-------------------------- */
const getStored = (key) => JSON.parse(localStorage.getItem(key)) || [];
const saveStored = (key, data) =>
    localStorage.setItem(key, JSON.stringify(data));

/* -------------------------
   DOM Elements
-------------------------- */
const activityForm = document.getElementById("activity-form");
const metricsForm = document.getElementById("metrics-form");

const recentList = document.getElementById("recent-list");
const activityStatus = document.getElementById("activity-status");
const metricStatus = document.getElementById("metric-status");

const rangeButtons = document.querySelectorAll("[data-range]");

/* -------------------------
   Chart Instances
-------------------------- */
let activityChart = null;
let metricChart = null;
let currentRange = 7;

/* ============================================================
   ACTIVITY FORM
============================================================ */
activityForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const activityType = document.querySelector(
        "input[name='activityType']:checked"
    )?.value;

    const duration = Number(
        document.getElementById("duration").value
    );

    const notes = document.getElementById("activity-notes").value.trim();

    if (!activityType || !duration) {
        activityStatus.textContent =
            "Please select an activity and enter a duration.";
        return;
    }

    const newActivity = {
        type: activityType,
        duration,
        notes,
        date: new Date().toISOString(),
    };

    const activities = getStored("activities");
    activities.push(newActivity);
    saveStored("activities", activities);

    activityStatus.textContent = "Activity logged successfully.";
    activityForm.reset();

    updateRecentActivity();
    updateActivityChart();
});

/* ============================================================
   METRICS FORM
============================================================ */
metricsForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const metricEntry = {
        steps: Number(document.getElementById("steps").value) || 0,
        water: Number(document.getElementById("water").value) || 0,
        sleep: Number(document.getElementById("sleep").value) || 0,
        calories: Number(document.getElementById("calories").value) || 0,
        date: new Date().toISOString(),
    };

    const metrics = getStored("metrics");
    metrics.push(metricEntry);
    saveStored("metrics", metrics);

    metricStatus.textContent = "Health metrics saved.";
    metricsForm.reset();

    updateMetricChart();
});

/* ============================================================
   RECENT ACTIVITY LIST
============================================================ */
function updateRecentActivity() {
    const activities = getStored("activities")
        .slice(-5)
        .reverse();

    recentList.innerHTML = "";

    if (activities.length === 0) {
        recentList.innerHTML = "<li>No activity logged yet.</li>";
        return;
    }

    activities.forEach((act) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${act.type}</strong> – ${act.duration} mins
            <br>
            <small>${new Date(act.date).toLocaleString()}</small>
        `;
        recentList.appendChild(li);
    });
}

/* ============================================================
   RANGE FILTER
============================================================ */
function filterByRange(data, days) {
    const now = Date.now();
    const limit = days * 24 * 60 * 60 * 1000;

    return data.filter(
        (item) =>
            now - new Date(item.date).getTime() <= limit
    );
}

rangeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentRange = Number(button.dataset.range);
        updateActivityChart();
        updateMetricChart();
    });
});

/* ============================================================
   ACTIVITY CHART
============================================================ */
function updateActivityChart() {
    const activities = filterByRange(
        getStored("activities"),
        currentRange
    );

    if (activities.length === 0) return;

    const ctx = document
        .getElementById("activityChart")
        .getContext("2d");

    if (activityChart instanceof Chart) {
        activityChart.destroy();
    }

    activityChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: activities.map((a) =>
                new Date(a.date).toLocaleDateString()
            ),
            datasets: [
                {
                    label: "Duration (minutes)",
                    data: activities.map((a) => a.duration),
                    borderWidth: 2,
                },
            ],
        },
    });
}

/* ============================================================
   METRICS CHART
============================================================ */
function updateMetricChart() {
    const metrics = filterByRange(
        getStored("metrics"),
        currentRange
    );

    if (metrics.length === 0) return;

    const ctx = document
        .getElementById("metricChart")
        .getContext("2d");

    if (metricChart instanceof Chart) {
        metricChart.destroy();
    }

    metricChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: metrics.map((m) =>
                new Date(m.date).toLocaleDateString()
            ),
            datasets: [
                {
                    label: "Steps",
                    data: metrics.map((m) => m.steps),
                },
                {
                    label: "Water (ml)",
                    data: metrics.map((m) => m.water),
                },
                {
                    label: "Sleep (hrs)",
                    data: metrics.map((m) => m.sleep),
                },
                {
                    label: "Calories",
                    data: metrics.map((m) => m.calories),
                },
            ],
        },
    });
}

/* ============================================================
   INITIALISE
============================================================ */
updateRecentActivity();
updateActivityChart();
updateMetricChart();
