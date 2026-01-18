import { formatRupiah } from '../utils.js';

export function renderProfitSummary(summary) {
    // summary = { totalProfit, totalExpense, netProfit }
    document.getElementById('total-profit-display').innerText = formatRupiah(summary.totalProfit);
    document.getElementById('total-expense-display').innerText = formatRupiah(summary.totalExpense);
    document.getElementById('net-profit-display').innerText = formatRupiah(summary.netProfit);

    // Color logic for Net Profit
    const netEl = document.getElementById('net-profit-display');
    if (summary.netProfit >= 0) {
        netEl.classList.add('text-green-600');
        netEl.classList.remove('text-red-500');
    } else {
        netEl.classList.add('text-red-500');
        netEl.classList.remove('text-green-600');
    }
}

export function renderProfitList(profits) {
    const listContainer = document.getElementById('profit-list');
    listContainer.innerHTML = '';

    if (profits.length === 0) {
        listContainer.innerHTML = '<p class="text-center text-gray-400 text-sm py-4 italic">Belum ada data profit.</p>';
        return;
    }

    profits.forEach(item => {
        listContainer.innerHTML += `
            <div class="flex items-center justify-between p-3 bg-white/50 rounded-lg sm:hover:bg-white transition-colors border-b border-gray-100 last:border-0 relative group">
                <button onclick="window.deleteProfit('${item.id}')" class="absolute -right-2 -top-2 bg-red-100 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-200 transition shadow-sm">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </div>
                    <div>
                        <p class="font-bold text-gray-800 text-sm">${item.stock_name}</p>
                        <p class="text-[10px] text-gray-400">${new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                </div>
                <span class="font-bold text-green-600 text-sm">+${formatRupiah(item.profit_amount)}</span>
            </div>
        `;
    });
}

export function renderExpenseList(expenses) {
    const listContainer = document.getElementById('expense-list');
    listContainer.innerHTML = '';

    if (expenses.length === 0) {
        listContainer.innerHTML = '<p class="text-center text-gray-400 text-sm py-4 italic">Belum ada pengeluaran.</p>';
        return;
    }

    expenses.forEach(item => {
        listContainer.innerHTML += `
            <div class="flex items-center justify-between p-3 bg-white/50 rounded-lg sm:hover:bg-white transition-colors border-b border-gray-100 last:border-0 relative group">
                <button onclick="window.deleteExpense('${item.id}')" class="absolute -right-2 -top-2 bg-red-100 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-200 transition shadow-sm">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center font-bold text-xs">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                    </div>
                    <div>
                        <p class="font-bold text-gray-800 text-sm capitalize">${item.description} <span class="text-[10px] bg-gray-100 text-gray-500 px-1 rounded ml-1 font-normal">${item.expense_type || 'Lainnya'}</span></p>
                        <p class="text-[10px] text-gray-400">${new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                </div>
                <span class="font-bold text-red-500 text-sm">-${formatRupiah(item.amount)}</span>
            </div>
        `;
    });
}
