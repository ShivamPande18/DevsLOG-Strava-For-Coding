function getNewStatHtml(line_count, hours, streak, langs, productivity) {
    return `
    <!DOCTYPE html>
<html>

<head>
    <style>
        :root {
            --bg-primary: #000000;
            --bg-overlay: rgba(0, 0, 0, 0.7);
            --text-primary: #ffffff;
            --text-secondary: #b3b3b3;
            --accent: #fc5200;
            --chart-bg: rgba(255, 255, 255, 0.1);
            --progress-bg: rgba(255, 255, 255, 0.1);
        }

        body {
            background-color: var(--bg-primary);
            color: var(--text-primary);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .container {
            width: 90vw;
            margin: 0 auto;
        }

        .header {
            background: linear-gradient(45deg, #2d2d2d, #1a1a1a);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 20px;
            position: relative;
        }

        .logo {
            font-size: 40px;
            font-weight: 800;
            margin-bottom: 20px;
        }

        .primary-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
            margin: 30px 0;
        }

        .stat-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .stat-value {
            font-size: 32px;
            font-weight: 600;
        }

        .stat-label {
            color: var(--text-secondary);
            font-size: 16px;
        }

        .achievement {
            display: flex;
            align-items: center;
            gap: 15px;
            background: rgba(255, 255, 255, 0.1);
            padding: 15px 20px;
            border-radius: 12px;
            margin: 20px 0;
        }

        .medal {
            background: linear-gradient(45deg, #cd7f32, #dfa76c);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: var(--bg-primary);
            font-weight: bold;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
        }

        .metric-card {
            background: linear-gradient(45deg, #2d2d2d, #1a1a1a);
            border-radius: 12px;
            padding: 20px;
        }

        .metric-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .progress-bar {
            height: 6px;
            background: var(--progress-bg);
            border-radius: 3px;
            overflow: hidden;
            margin: 8px 0;
        }

        .progress-fill {
            height: 100%;
            background: var(--accent);
            border-radius: 3px;
            transition: width 1s ease-in-out;
        }

        .mini-chart {
            height: 60px;
            display: flex;
            align-items: flex-end;
            gap: 3px;
            margin-top: 15px;
        }

        .chart-bar {
            flex: 1;
            background: var(--accent);
            border-radius: 3px 3px 0 0;
            transition: height 0.3s ease;
        }

        .language-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .time-distribution {
            display: flex;
            height: 20px;
            border-radius: 10px;
            overflow: hidden;
            margin: 15px 0;
        }

        .time-segment {
            height: 100%;
            transition: width 0.3s ease;
        }

        .streak-calendar {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 4px;
            margin-top: 15px;
        }

        .calendar-day {
            aspect-ratio: 1;
            background: var(--chart-bg);
            border-radius: 2px;
        }

        .calendar-day.active {
            background: var(--accent);
        }

        .performance-indicators {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }

        .indicator {
            flex: 1;
            height: 4px;
            background: var(--chart-bg);
            border-radius: 2px;
        }

        .indicator.filled {
            background: var(--accent);
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <div class="logo">DEVLOGS <span style="font-size: 30px; font-weight: 500;">:
                    Session Report</span> </div>

            <!-- <div style="font-size: 28px; margin-bottom: 30px;">Coding Session Today</div> -->

            <div class="primary-stats">
                <div class="stat-item">
                    <div class="stat-value">${line_count}</div>
                    <div class="stat-label">Lines</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${hours}</div>
                    <div class="stat-label">hours</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${productivity}%</div>
                    <div class="stat-label">{Productivity}</div>
                </div>
            </div>
        </div>

        <div class="metrics-grid">

            <div class="metric-card">
                <div style="display: flex; flex-direction: column;">
                    <div style="font-weight: 500;">Coding Streak</div>
                    <div
                        style="color: rgb(255, 166, 0); font-size: 4rem; text-align: center; margin-top: 20px; font-weight: bold;">
                        ${streak} days</div>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-header">
                    <div style="font-weight: 500;">Language Distribution</div>
                </div>
                <div class="language-item">
                    <span>${langs[0] ? langs[0].split("-")[0] : ""}</span>
                    <span>${langs[0] ? langs[0].split("-")[1] : ""}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${langs[0] ? langs[0].split("-")[1] : 0}%"></div>
                </div>
                <div class="language-item">
                    <span>${langs[1] ? langs[1].split("-")[0] : "-"}</span>
                    <span>${langs[1] ? langs[1].split("-")[1] : "-"}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${langs[1] ? langs[1].split("-")[1] : 0}%"></div>
                </div>
                <div class="language-item">
                    <span>${langs[2] ? langs[2].split("-")[0] : "-"}</span>
                    <span>${langs[2] ? langs[2].split("-")[1] : "-"}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${langs[2] ? langs[2].split("-")[1] : 0}%"></div>
                </div>
            </div>


        </div>
    </div>
</body>

</html>
    `
}

module.exports = { getNewStatHtml }