const calculateTotalDays = (month, day, year) => {
    const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let days = year * 365 + day;

    // Add days for months passed in current year
    for (let i = 0; i < month - 1; i++) {
        days += daysInMonths[i];
    }

    // Add a day for each leap year
    days += Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400);

    return days;
};

function msToHours(ms) {
    return parseFloat((ms / (1000 * 60 * 60)).toFixed(2));
}


function getLast30Days(curDate, dates, sessionTimes, sessionTime) {
    const endDate = new Date(curDate);

    // Create array to store results
    const result = new Array(30).fill(0);

    // Filter out dates not in last 30 days
    const thirtyDaysAgo = new Date(endDate);
    thirtyDaysAgo.setDate(endDate.getDate() - 30);


    // Remove dates outside 30 day window
    for (let i = dates.length - 1; i >= 0; i--) {
        const dateObj = new Date(dates[i]);
        if (dateObj < thirtyDaysAgo || dateObj > endDate) {
            dates.splice(i, 1);
            sessionTimes.splice(i, 1);
        }
    }

    if (dates[dates.length - 1] === curDate) {
        sessionTimes[sessionTimes.length - 1] += sessionTime || 0;
    } else {
        dates.push(curDate);
        sessionTimes.push(sessionTime || 0);
    }

    // Loop through last 30 days
    for (let i = 0; i < 30; i++) {
        // Get date for current index
        const currentDate = new Date(endDate);
        currentDate.setDate(endDate.getDate() - i);

        // Convert to string format matching dates array
        const dateStr = currentDate.toLocaleDateString("en-US");

        // Check if date exists in dates array and get corresponding hours
        const dateIndex = dates.indexOf(dateStr);
        if (dateIndex !== -1) {
            result[i] = Math.floor(msToHours(sessionTimes[dateIndex]));
        }
    }

    return [result, dates, sessionTimes];
}

function getLast7Days(curDate, dates, hours) {
    const weeklyHours = new Array(7).fill(0);

    // Loop through last 7 days
    for (let i = 0; i < 7; i++) {
        // Get date for current index
        const currentDate = new Date(curDate);
        currentDate.setDate(currentDate.getDate() - i);

        // Convert to string format matching dates array
        const dateStr = currentDate.toLocaleDateString("en-US");

        // Find index of this date in dates array
        const dateIndex = dates.indexOf(dateStr);

        // If date exists in dates array, get corresponding hours value
        if (dateIndex !== -1) {
            weeklyHours[i] = hours[dateIndex];
        }
    }

    return weeklyHours;
}

module.exports = { calculateTotalDays, getLast30Days, getLast7Days, msToHours }