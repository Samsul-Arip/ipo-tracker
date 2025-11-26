export function getColorClass(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return 'text-gray-400';
    if (num > 0) return 'text-green-600 font-bold';
    if (num < 0) return 'text-red-600 font-bold';
    return 'text-yellow-600 font-bold';
}

export function formatPercent(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return "-";
    return (num > 0 ? "+" : "") + num + "%";
}

export function getUWBadgeClass(uw, globalStocks) {
    // Note: This requires globalStocks to be passed in, or we need to calculate stats elsewhere.
    // For now, let's assume we pass the stats map or the full list.
    // To keep it pure, let's calculate stats inside if list is passed.

    if (!globalStocks || globalStocks.length === 0) return "bg-gray-200 text-gray-700";

    const uwGlobalStats = {};
    globalStocks.forEach(s => {
        if (s.uw && s.uw !== "-") {
            if (!uwGlobalStats[s.uw]) uwGlobalStats[s.uw] = { count: 0, w1: 0, w2: 0, w3: 0 };
            uwGlobalStats[s.uw].count++;
            if (s.d1 > 0) uwGlobalStats[s.uw].w1++;
            if (s.d2 > 0) uwGlobalStats[s.uw].w2++;
            if (s.d3 > 0) uwGlobalStats[s.uw].w3++;
        }
    });

    if (!uwGlobalStats[uw]) return "bg-gray-200 text-gray-700";
    const s = uwGlobalStats[uw];
    const avgWr = ((s.w1 / s.count) + (s.w2 / s.count)) / 2 * 100;
    if (avgWr >= 90) return "bg-green-600 text-white";
    if (avgWr >= 80) return "bg-green-100 text-green-800";
    return "bg-red-500 text-white";
}
