export function renderAccountList(accounts, append = false) {
    const listContainer = document.getElementById('account-list');

    if (!append) {
        listContainer.className = 'bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden';
        listContainer.innerHTML = '';
    }

    if (accounts.length === 0 && !append) {
        listContainer.innerHTML = `
            <div class="p-10 text-center">
                <p class="text-gray-500 font-medium">Belum ada akun terdaftar.</p>
            </div>
        `;
        return;
    }

    // Sort accounts by entry_number from small to large (1, 2, 3, 4, 5...)
    const sortedAccounts = [...accounts].sort((a, b) => {
        const entryA = parseInt(a.entry_number) || 0;
        const entryB = parseInt(b.entry_number) || 0;
        return entryA - entryB;
    });


    if (append) {
        // In append mode, just add rows to existing tbody
        let tbody = listContainer.querySelector('tbody');
        if (!tbody) {
            // If tbody doesn't exist (shouldn't happen), create the table first
            append = false;
        } else {
            // Append new rows to existing table
            sortedAccounts.forEach(account => {
                const row = document.createElement('tr');
                row.className = 'bg-white hover:bg-gray-50 transition-colors';
                row.innerHTML = `
                    <td class="px-6 py-4">
                        ${account.entry_number ? `<span class="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">#${account.entry_number}</span>` : '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                ${account.name.charAt(0).toUpperCase()}
                            </div>
                            <span class="font-semibold text-gray-800">${account.name}</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-600">${account.email || '-'}</td>
                    <td class="px-6 py-4 font-mono text-gray-600">${account.phone || '-'}</td>
                    <td class="px-6 py-4 font-mono font-medium text-gray-600">${account.rdn || '-'}</td>
                    <td class="px-6 py-4">
                        <span class="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wide">
                            ${account.device_user || '-'}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <div class="flex items-center justify-center gap-2">
                            <button onclick="window.editAccount('${account.id}')" class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                            <button onclick="window.deleteAccount('${account.id}')" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Hapus">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
            return;
        }
    }

    // Create full table (initial load or replace mode)
    let tableHtml = `
        <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
                <thead class="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-4 font-bold text-gray-700">Entry No</th>
                        <th class="px-6 py-4 font-bold text-gray-700">Nama Akun</th>
                        <th class="px-6 py-4 font-bold text-gray-700">Email</th>
                        <th class="px-6 py-4 font-bold text-gray-700">No. HP</th>
                        <th class="px-6 py-4 font-bold text-gray-700">RDN</th>
                        <th class="px-6 py-4 font-bold text-gray-700">Device</th>
                        <th class="px-6 py-4 font-bold text-gray-700 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
    `;

    sortedAccounts.forEach(account => {
        tableHtml += `
            <tr class="bg-white hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                    ${account.entry_number ? `<span class="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">#${account.entry_number}</span>` : '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            ${account.name.charAt(0).toUpperCase()}
                        </div>
                        <span class="font-semibold text-gray-800">${account.name}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-gray-600">${account.email || '-'}</td>
                <td class="px-6 py-4 font-mono text-gray-600">${account.phone || '-'}</td>
                <td class="px-6 py-4 font-mono font-medium text-gray-600">${account.rdn || '-'}</td>
                <td class="px-6 py-4">
                    <span class="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wide">
                        ${account.device_user || '-'}
                    </span>
                </td>
                <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="window.editAccount('${account.id}')" class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button onclick="window.deleteAccount('${account.id}')" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Hapus">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableHtml += `
                </tbody>
            </table>
        </div>
    `;

    listContainer.innerHTML = tableHtml;
}
