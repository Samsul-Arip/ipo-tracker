import { getColorClass, formatPercent, getUWBadgeClass } from '../utils.js';
import { ITEMS_PER_PAGE } from '../config.js';

export function showLoading(isLoading) {
    document.getElementById('loading-overlay').classList.toggle('hidden', !isLoading);
}

export function renderTableRows(data, globalStocks) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    data.forEach(stock => {
        tbody.innerHTML += `
        <tr class="hover:bg-gray-50 border-b border-gray-100">
            <td class="px-4 py-3 md:px-6 md:py-4 font-bold text-gray-900">${stock.code}</td>
            <td class="px-4 py-3 md:px-6 md:py-4 text-xs text-gray-500">${stock.date}</td>
            <td class="px-4 py-3 md:px-6 md:py-4"><span class="px-2 py-1 text-xs font-semibold rounded ${getUWBadgeClass(stock.uw, globalStocks)}">${stock.uw}</span></td>
            <td class="px-4 py-3 md:px-6 md:py-4 text-center bg-gray-50/50 ${getColorClass(stock.d1)}">${formatPercent(stock.d1)}</td>
            <td class="px-4 py-3 md:px-6 md:py-4 text-center ${getColorClass(stock.d2)}">${formatPercent(stock.d2)}</td>
            <td class="px-4 py-3 md:px-6 md:py-4 text-center ${getColorClass(stock.d3)}">${formatPercent(stock.d3)}</td>
            <td class="px-4 py-3 md:px-6 md:py-4 text-center ${getColorClass(stock.d4)}">${formatPercent(stock.d4)}</td>
            <td class="px-4 py-3 md:px-6 md:py-4 text-center ${getColorClass(stock.d5)}">${formatPercent(stock.d5)}</td>
            <td class="px-4 py-3 md:px-6 md:py-4 text-center ${getColorClass(stock.d6)}">${formatPercent(stock.d6)}</td>
            <td class="px-4 py-3 md:px-6 md:py-4 text-center bg-gray-50/50 ${getColorClass(stock.d7)}">${formatPercent(stock.d7)}</td>
        </tr>
    `;
    });

    if (data.length === 0) {
        tbody.innerHTML = `
        <tr>
            <td colspan="10" class="px-6 py-8 text-center text-gray-500 italic">
                Data tidak ditemukan.
            </td>
        </tr>
    `;
    }
}

export function renderPaginationControls(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    let container = document.getElementById('pagination-container');

    if (!container) {
        const tableContainer = document.querySelector('.overflow-x-auto');
        const newDiv = document.createElement('div');
        newDiv.id = 'pagination-container';
        newDiv.className = "px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between";
        tableContainer.parentNode.appendChild(newDiv);
        container = newDiv;
    }

    if (totalPages <= 1 && totalItems > 0) {
        container.classList.remove('hidden');
    } else if (totalItems === 0) {
        container.classList.add('hidden');
        return;
    } else {
        container.classList.remove('hidden');
    }

    container.innerHTML = `
    <div class="text-sm text-gray-500">
        Halaman <span class="font-bold text-gray-800">${currentPage}</span> dari <span class="font-bold text-gray-800">${totalPages || 1}</span>
    </div>
    <div class="flex gap-2">
        <button onclick="window.loadTablePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} 
            class="px-3 py-1 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition">
            Sebelumnya
        </button>
        <button onclick="window.loadTablePage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}
            class="px-3 py-1 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition">
            Selanjutnya
        </button>
    </div>
`;
}

export function renderAdminTableRows(data) {
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '';

    data.forEach((stock, index) => {
        // We need to pass the index relative to the current page data, which works for editStock
        // But editStock needs to know which data array to use. 
        // In main.js we will expose editStock which will use the currentAdminData.
        tbody.innerHTML += `
        <tr class="hover:bg-gray-50 border-b">
            <td class="px-6 py-3 font-bold text-gray-800">${stock.code}</td>
            <td class="px-6 py-3 text-gray-600">${stock.uw}</td>
            <td class="px-6 py-3 text-center ${getColorClass(stock.d1)}">${formatPercent(stock.d1)}</td>
            <td class="px-6 py-3 text-center space-x-2">
                <button onclick="window.editStock(${index})" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-xs font-bold shadow">Edit</button>
                <button onclick="window.deleteStock(${stock.id})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold shadow">Hapus</button>
            </td>
        </tr>
    `;
    });

    if (data.length === 0) {
        tbody.innerHTML = `
        <tr>
            <td colspan="4" class="px-6 py-8 text-center text-gray-500 italic">
                Data tidak ditemukan.
            </td>
        </tr>
    `;
    }
}

export function renderAdminPaginationControls(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const container = document.getElementById('admin-pagination-container');

    if (totalPages <= 1 && totalItems > 0) {
        container.classList.remove('hidden');
    } else if (totalItems === 0) {
        container.classList.add('hidden');
        return;
    } else {
        container.classList.remove('hidden');
    }

    container.innerHTML = `
    <div class="text-sm text-gray-500">
        Halaman <span class="font-bold text-gray-800">${currentPage}</span> dari <span class="font-bold text-gray-800">${totalPages || 1}</span>
    </div>
    <div class="flex gap-2">
        <button onclick="window.loadAdminTablePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} 
            class="px-3 py-1 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition">
            Sebelumnya
        </button>
        <button onclick="window.loadAdminTablePage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}
            class="px-3 py-1 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition">
            Selanjutnya
        </button>
    </div>
`;
}

export function updateDashboardStats(globalStocks) {
    let count = 0, wins1 = 0, losses = 0;
    let streakCandidates = [];

    globalStocks.forEach(stock => {
        count++;
        if (stock.d1 > 0) wins1++;
        if (stock.d1 < 0) losses++;
        if (stock.d1 > 0 && stock.d2 > 0 && stock.d3 > 0 && stock.d4 > 0 && stock.d5 > 0 && stock.d6 > 0) {
            if (stock.uw && stock.uw !== "-") streakCandidates.push(stock.uw);
        }
    });

    document.getElementById('total-saham').innerText = count;
    document.getElementById('breadth-green').innerText = wins1;
    document.getElementById('breadth-red').innerText = losses;

    // Update Streak Card
    const streakEl = document.getElementById('top-uw-streak');
    if (streakCandidates.length > 0) {
        let uwGlobalStats = {};
        globalStocks.forEach(s => {
            if (s.uw && s.uw !== "-") {
                if (!uwGlobalStats[s.uw]) uwGlobalStats[s.uw] = { count: 0, w1: 0, w2: 0, w3: 0 };
                uwGlobalStats[s.uw].count++;
                if (s.d1 > 0) uwGlobalStats[s.uw].w1++;
                if (s.d2 > 0) uwGlobalStats[s.uw].w2++;
                if (s.d3 > 0) uwGlobalStats[s.uw].w3++;
            }
        });

        let bestUW = null;
        let bestAvgWR = -1;
        streakCandidates.forEach(uw => {
            const s = uwGlobalStats[uw];
            if (s) {
                const avg = ((s.w1 / s.count) + (s.w2 / s.count) + (s.w3 / s.count)) / 3 * 100;
                if (avg > bestAvgWR) {
                    bestAvgWR = avg;
                    bestUW = uw;
                }
            }
        });

        if (bestUW) {
            streakEl.innerHTML = `${bestUW} <span class="text-sm font-normal text-gray-600 block">Avg WR: ${bestAvgWR.toFixed(0)}%</span>`;
        } else {
            streakEl.innerText = "-";
        }
    } else {
        streakEl.innerText = "-";
    }
}

export function populateUWFilter(globalStocks) {
    const uwSelect = document.getElementById('uwFilter');
    const currentVal = uwSelect.value;
    const uws = [...new Set(globalStocks.map(s => s.uw).filter(uw => uw && uw !== "-"))].sort();

    // Keep "Semua Underwriter" option
    if (uwSelect.options.length <= 1 || uwSelect.options[0].value !== "") {
        uwSelect.innerHTML = '<option value="">Semua Underwriter</option>';
    }

    // Add new UWs, avoiding duplicates
    const existingOptions = Array.from(uwSelect.options).map(opt => opt.value);
    uws.forEach(uw => {
        if (!existingOptions.includes(uw)) {
            const option = document.createElement('option');
            option.value = uw;
            option.innerText = uw;
            uwSelect.appendChild(option);
        }
    });
    // Restore selection
    if (uws.includes(currentVal)) uwSelect.value = currentVal;
}

export function renderTopUWSection(globalStocks) {
    let uwStats = {};
    globalStocks.forEach(s => {
        if (s.uw && s.uw !== "-") {
            if (!uwStats[s.uw]) uwStats[s.uw] = { count: 0, w1: 0, w2: 0, w3: 0 };
            uwStats[s.uw].count++;
            if (s.d1 > 0) uwStats[s.uw].w1++;
            if (s.d2 > 0) uwStats[s.uw].w2++;
            if (s.d3 > 0) uwStats[s.uw].w3++;
        }
    });

    let topList = [];
    for (let [uw, s] of Object.entries(uwStats)) {
        let wr1 = (s.w1 / s.count) * 100;
        let wr2 = (s.w2 / s.count) * 100;
        let avg = (wr1 + wr2) / 2;
        topList.push({ uw, count: s.count, avg, wr1, wr2 });
    }
    topList.sort((a, b) => {
        if (b.avg !== a.avg) return b.avg - a.avg;
        return b.count - a.count;
    });

    const section = document.getElementById('top-uw-section');
    const grid = document.getElementById('top-uw-grid');

    if (topList.length === 0) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');
    grid.innerHTML = '';

    topList.forEach((item, i) => {
        const rank = i + 1;
        let rankColor = "bg-gray-100 text-gray-600";
        if (rank === 1) rankColor = "bg-yellow-100 text-yellow-700 border border-yellow-200";
        if (rank === 2) rankColor = "bg-gray-100 text-gray-700 border border-gray-200";
        if (rank === 3) rankColor = "bg-orange-100 text-orange-700 border border-orange-200";

        const wrColor = item.avg >= 80 ? "text-green-600" : "text-red-600";

        grid.innerHTML += `
            <div class="bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex items-center justify-between group cursor-pointer" onclick="window.openUWDetailModal('${item.uw}')">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full ${rankColor} flex items-center justify-center font-bold shadow-sm">
                        ${rank}
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-800 text-lg leading-tight">${item.uw}</h4>
                        <p class="text-xs text-gray-500 font-medium">${item.count} Emiten</p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-black ${wrColor}">${item.avg.toFixed(0)}%</div>
                    <div class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Win Rate</div>
                </div>
            </div>
        `;
    });
}

export function openTopUWModal(globalStocks) {
    document.getElementById('top-uw-modal').classList.remove('hidden');
    document.getElementById('top-uw-modal').classList.add('flex');

    let uwStats = {};
    globalStocks.forEach(s => {
        if (s.uw && s.uw !== "-") {
            if (!uwStats[s.uw]) uwStats[s.uw] = { count: 0, w1: 0, w2: 0, w3: 0 };
            uwStats[s.uw].count++;
            if (s.d1 > 0) uwStats[s.uw].w1++;
            if (s.d2 > 0) uwStats[s.uw].w2++;
            if (s.d3 > 0) uwStats[s.uw].w3++;
        }
    });

    let topList = [];
    for (let [uw, s] of Object.entries(uwStats)) {
        let wr1 = (s.w1 / s.count) * 100;
        let wr2 = (s.w2 / s.count) * 100;
        let avg = (wr1 + wr2) / 2;
        topList.push({ uw, count: s.count, avg, wr1, wr2 });
    }
    topList.sort((a, b) => {
        if (b.avg !== a.avg) return b.avg - a.avg;
        return b.count - a.count;
    });

    const listEl = document.getElementById('modal-top-uw-list');
    listEl.innerHTML = '';
    if (topList.length === 0) listEl.innerHTML = '<p class="text-center text-gray-500">Tidak ada data</p>';

    topList.forEach((item, i) => {
        const rank = i + 1;
        let rankBadge = `<span class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 font-bold text-sm shadow-inner">#${rank}</span>`;
        let borderClass = "border-l-4 border-gray-300";

        if (rank === 1) {
            rankBadge = `<span class="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 font-bold text-sm shadow-inner border border-yellow-300">🥇</span>`;
            borderClass = "border-l-4 border-yellow-400";
        } else if (rank === 2) {
            rankBadge = `<span class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm shadow-inner border border-gray-300">🥈</span>`;
            borderClass = "border-l-4 border-gray-400";
        } else if (rank === 3) {
            rankBadge = `<span class="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-sm shadow-inner border border-orange-300">🥉</span>`;
            borderClass = "border-l-4 border-orange-400";
        }

        const badgeBg = item.avg >= 80 ? "bg-green-600" : "bg-red-600";

        listEl.innerHTML += `
        <div class="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow ${borderClass} cursor-pointer" onclick="window.openUWDetailModal('${item.uw}')">
            <div class="flex items-center gap-4">
                <div class="flex-shrink-0">${rankBadge}</div>
                <div>
                    <div class="text-lg font-bold text-gray-800 leading-none">${item.uw}</div>
                    <div class="text-xs text-gray-500 mt-1 font-medium bg-gray-100 px-2 py-0.5 rounded-full inline-block">${item.count} Emiten</div>
                </div>
            </div>
            <div class="text-right">
                <div class="flex flex-col items-end">
                    <span class="${badgeBg} text-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm mb-1">${item.avg.toFixed(0)}%</span>
                    <span class="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Avg 2 Days</span>
                </div>
                <div class="mt-2 flex gap-2 text-[10px] text-gray-500 font-mono">
                    <span title="Day 1 Win Rate">D1:${item.wr1.toFixed(0)}%</span>
                    <span class="text-gray-300">|</span>
                    <span title="Day 2 Win Rate">D2:${item.wr2.toFixed(0)}%</span>
                </div>
            </div>
        </div>
    `;
    });
}

export function closeTopUWModal() {
    document.getElementById('top-uw-modal').classList.add('hidden');
    document.getElementById('top-uw-modal').classList.remove('flex');
}

export function openUWDetailModal(uwName, globalStocks) {
    // Close top UW modal first if open
    closeTopUWModal();

    document.getElementById('uw-detail-modal').classList.remove('hidden');
    document.getElementById('uw-detail-modal').classList.add('flex');
    document.getElementById('uw-detail-name').innerText = uwName;

    // Filter stocks by this UW
    const stocks = globalStocks.filter(s => s.uw === uwName);

    // Sort by date descending (newest first)
    stocks.sort((a, b) => new Date(b.date) - new Date(a.date));

    const listEl = document.getElementById('uw-detail-list');
    listEl.innerHTML = '';

    if (stocks.length === 0) {
        listEl.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-8 text-center text-gray-500 italic">Tidak ada data saham untuk underwriter ini.</td>
            </tr>
        `;
        return;
    }

    stocks.forEach(stock => {
        const d1Class = stock.d1 > 0 ? 'text-green-600 font-bold' : stock.d1 < 0 ? 'text-red-600 font-bold' : 'text-yellow-600';
        const d2Class = stock.d2 > 0 ? 'text-green-600 font-bold' : stock.d2 < 0 ? 'text-red-600 font-bold' : 'text-yellow-600';
        const d3Class = stock.d3 > 0 ? 'text-green-600 font-bold' : stock.d3 < 0 ? 'text-red-600 font-bold' : 'text-yellow-600';

        const formatPct = (val) => {
            const num = parseFloat(val);
            if (isNaN(num)) return '-';
            return (num > 0 ? '+' : '') + num + '%';
        };

        listEl.innerHTML += `
            <tr class="hover:bg-gray-50 border-b border-gray-100">
                <td class="px-6 py-3 font-bold text-gray-800">${stock.code}</td>
                <td class="px-6 py-3 text-gray-600">${stock.date}</td>
                <td class="px-6 py-3 text-center ${d1Class}">${formatPct(stock.d1)}</td>
                <td class="px-6 py-3 text-center ${d2Class}">${formatPct(stock.d2)}</td>
                <td class="px-6 py-3 text-center ${d3Class}">${formatPct(stock.d3)}</td>
            </tr>
        `;
    });
}

export function closeUWDetailModal() {
    document.getElementById('uw-detail-modal').classList.add('hidden');
    document.getElementById('uw-detail-modal').classList.remove('flex');
}
