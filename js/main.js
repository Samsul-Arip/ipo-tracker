console.log("Main.js loading...");
import { fetchGlobalStocks, fetchStocks, fetchAdminStocks, checkDuplicateStock, upsertStock, deleteStockById, fetchAccounts, fetchAccountDevices, checkDuplicateEmail, upsertAccount, deleteAccount, fetchProfits, upsertProfit, deleteProfit, fetchExpenses, upsertExpense, deleteExpense } from './services/api.js';
import { showLoading, renderTableRows, renderPaginationControls, renderAdminTableRows, renderAdminPaginationControls, updateDashboardStats, renderTopUWSection, populateUWFilter, openTopUWModal, closeTopUWModal, openUWDetailModal, closeUWDetailModal } from './ui/renderers.js';
import { renderAccountList } from './ui/account_renderer.js';
import { renderProfitList, renderExpenseList, renderProfitSummary } from './ui/profit_renderer.js';
import { showToast } from './ui/toast.js';
import { login, logout, getUser } from './auth.js';

// --- STATE ---
let globalStocks = [];
let currentPage = 1;
let adminCurrentPage = 1;
let currentAdminData = [];
let currentAccounts = []; // Local state for accounts

// --- ORCHESTRATORS ---

async function refreshData() {
    showLoading(true);
    try {
        // 1. Fetch Global Data for Stats
        globalStocks = await fetchGlobalStocks();
        updateDashboardStats(globalStocks);
        renderTopUWSection(globalStocks);
        populateUWFilter(globalStocks);

        // 2. Fetch First Page for Table
        await loadTablePage(1);
    } catch (error) {
        console.error("Error refreshing data:", error);
        showToast("Gagal memuat data.", "error");
    } finally {
        showLoading(false);
    }
}

let currentAccountPage = 1;
const ACCOUNT_PAGE_SIZE = 20; // Increased for infinite scroll
let isLoadingAccounts = false;
let hasMoreAccounts = true;
let totalAccountCount = 0;

// Search & Filter
let accountSearchTimeout;

window.handleAccountSearch = function () {
    clearTimeout(accountSearchTimeout);
    accountSearchTimeout = setTimeout(() => {
        // Reset to page 1 when searching
        currentAccountPage = 1;
        hasMoreAccounts = true;
        loadAccountPage(1, false); // false = replace (not append)
    }, 500);
};

async function loadAccountPage(page = 1, append = false) {
    if (isLoadingAccounts) return; // Prevent duplicate requests

    isLoadingAccounts = true;
    if (!append) showLoading(true);

    // Show loading indicator for append mode
    const loadingIndicator = document.getElementById('account-loading-indicator');
    const endIndicator = document.getElementById('account-end-indicator');
    if (append && loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
    }
    if (endIndicator) {
        endIndicator.classList.add('hidden');
    }

    currentAccountPage = page;
    try {
        const filterSelect = document.getElementById('deviceUserFilter');
        const searchBox = document.getElementById('accountSearchBox');

        const filterValue = filterSelect ? filterSelect.value : null;
        const searchQuery = searchBox ? searchBox.value : '';

        // Fetch Paginated Data
        const { data, count } = await fetchAccounts(page, ACCOUNT_PAGE_SIZE, filterValue, searchQuery);
        currentAccounts = append ? [...currentAccounts, ...data] : data; // Append or replace
        totalAccountCount = count;

        // Check if there are more items to load
        hasMoreAccounts = (page * ACCOUNT_PAGE_SIZE) < count;

        // Update Count Badge (Total in DB)
        const countBadge = document.getElementById('total-account-count');
        if (countBadge) countBadge.innerText = count;

        renderAccountList(data, append);

        // Show end indicator if no more accounts
        const loadingIndicator = document.getElementById('account-loading-indicator');
        const endIndicator = document.getElementById('account-end-indicator');
        if (!hasMoreAccounts && endIndicator) {
            endIndicator.classList.remove('hidden');
        }

        // Populate Filter Dropdown (Independent of Page)
        if (filterSelect) {
            const currentFilter = filterSelect.value;
            const uniqueDevices = await fetchAccountDevices();

            let options = '<option value="">Semua Device</option>';
            uniqueDevices.forEach(device => {
                const selected = device === currentFilter ? 'selected' : '';
                options += `<option value="${device}" ${selected}>${device}</option>`;
            });
            filterSelect.innerHTML = options;
        }

    } catch (error) {
        console.error("Error loading accounts:", error);
        if (error.code === '42P01') {
            showToast("Tabel 'accounts' belum dibuat. Jalankan script SQL!", "error");
        } else {
            showToast("Gagal memuat data akun.", "error");
        }
    } finally {
        isLoadingAccounts = false;
        if (!append) showLoading(false);

        // Hide loading indicator
        const loadingIndicator = document.getElementById('account-loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
    }
}

function filterAccounts() {
    // When filtering, reset to page 1 to fetch filtered results from DB
    currentAccountPage = 1;
    hasMoreAccounts = true;
    loadAccountPage(1, false); // false = replace
}

function renderAccountPagination(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / ACCOUNT_PAGE_SIZE);
    const container = document.getElementById('account-pagination-container');
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    // Prev
    html += `<button onclick="loadAccountPage(${currentPage - 1})" class="px-3 py-1 rounded-lg border hover:bg-gray-100 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>`;

    // Page Numbers (Simple)
    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage;
        html += `<button onclick="loadAccountPage(${i})" class="px-3 py-1 rounded-lg border ${isActive ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100'}">${i}</button>`;
    }

    // Next
    html += `<button onclick="loadAccountPage(${currentPage + 1})" class="px-3 py-1 rounded-lg border hover:bg-gray-100 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;

    container.innerHTML = html;
}

async function loadProfitPage() {
    showLoading(true);
    try {
        const profits = await fetchProfits();
        const expenses = await fetchExpenses();

        // Calculate Summary
        const totalProfit = profits.reduce((sum, item) => sum + (parseFloat(item.profit_amount) || 0), 0);
        const totalExpense = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const netProfit = totalProfit - totalExpense;

        renderProfitSummary({ totalProfit, totalExpense, netProfit });
        renderProfitList(profits);
        renderExpenseList(expenses);
    } catch (error) {
        console.error("Error loading profit/expense:", error);
        showToast("Gagal memuat data keuangan.", "error");
    } finally {
        showLoading(false);
    }
}

async function loadTablePage(page) {
    showLoading(true);
    currentPage = page;
    const search = document.getElementById('searchBox') ? document.getElementById('searchBox').value : '';
    const uwFilter = document.getElementById('uwFilter') ? document.getElementById('uwFilter').value : '';

    try {
        const { data, count } = await fetchStocks(page, search, uwFilter);
        renderTableRows(data, globalStocks);
        renderPaginationControls(count, currentPage);
    } catch (error) {
        console.error("Error loading page:", error);
        showToast("Gagal memuat halaman.", "error");
    } finally {
        showLoading(false);
    }
}

async function loadAdminTablePage(page) {
    showLoading(true);
    adminCurrentPage = page;
    const search = document.getElementById('adminSearchBox') ? document.getElementById('adminSearchBox').value : '';

    try {
        const { data, count } = await fetchAdminStocks(page, search);
        currentAdminData = data; // Update local state for editStock
        renderAdminTableRows(data);
        renderAdminPaginationControls(count, adminCurrentPage);
    } catch (error) {
        console.error("Error loading admin page:", error);
        showToast("Gagal memuat halaman admin.", "error");
    } finally {
        showLoading(false);
    }
}

// --- ACTIONS ---

async function handleDeleteStock(id) {
    if (!confirm("Yakin ingin menghapus data ini dari Database Permanen?")) return;
    showLoading(true);
    try {
        await deleteStockById(id);
        await refreshData();
        await loadAdminTablePage(adminCurrentPage);
        showToast("Data berhasil dihapus.", "success");
    } catch (error) {
        console.error("Error deleting:", error);
        showToast("Gagal menghapus data.", "error");
    } finally {
        showLoading(false);
    }
}

function handleEditStock(index) {
    const stock = currentAdminData[index];
    if (!stock) return;

    document.getElementById('edit-id').value = stock.id;
    document.getElementById('code').value = stock.code;
    document.getElementById('date').value = stock.date;
    document.getElementById('uw').value = stock.uw;
    document.getElementById('float').value = stock.float;
    document.getElementById('d1').value = stock.d1;
    document.getElementById('d2').value = stock.d2;
    document.getElementById('d3').value = stock.d3;
    document.getElementById('d4').value = stock.d4;
    document.getElementById('d5').value = stock.d5;
    document.getElementById('d6').value = stock.d6;
    document.getElementById('d7').value = stock.d7;

    // UI Changes
    document.getElementById('form-title').innerText = "Edit Data Database: " + stock.code;
    document.getElementById('btn-submit').innerText = "Update Data";
    document.getElementById('btn-submit').classList.remove('bg-blue-600');
    document.getElementById('btn-submit').classList.add('bg-green-600');
    document.getElementById('btn-cancel').classList.remove('hidden');

    document.getElementById('admin-page').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
    document.getElementById('inputForm').reset();
    document.getElementById('edit-id').value = "";
    document.getElementById('form-title').innerText = "Input Data Baru (Database)";
    document.getElementById('btn-submit').innerText = "Simpan ke Database";
    document.getElementById('btn-submit').classList.add('bg-blue-600');
    document.getElementById('btn-submit').classList.remove('bg-green-600');
    document.getElementById('btn-cancel').classList.add('hidden');
}

// Account Actions
// Account Actions
function openAccountModal() {
    document.getElementById('accountForm').reset();
    document.getElementById('account-id').value = "";
    document.getElementById('account-modal-title').innerText = "Tambah Akun Baru";
    document.getElementById('btn-save-account').innerText = "Simpan Akun";

    document.getElementById('account-modal').classList.remove('hidden');
    document.getElementById('account-modal').classList.add('flex');
}

function closeAccountModal() {
    document.getElementById('account-modal').classList.add('hidden');
    document.getElementById('account-modal').classList.remove('flex');
}

function handleEditAccount(id) {
    const account = currentAccounts.find(a => a.id === id);
    if (!account) return;

    // Populate Modal
    document.getElementById('account-id').value = account.id;
    document.getElementById('acc-name').value = account.name;
    document.getElementById('acc-email').value = account.email || '';
    document.getElementById('acc-phone').value = account.phone || '';
    document.getElementById('acc-rdn').value = account.rdn || '';
    document.getElementById('acc-device').value = account.device_user || '';
    document.getElementById('acc-entry').value = account.entry_number || '';

    // Update Modal UI
    document.getElementById('account-modal-title').innerText = "Edit Akun RDN";
    document.getElementById('btn-save-account').innerText = "Update Akun";

    // Show Modal
    document.getElementById('account-modal').classList.remove('hidden');
    document.getElementById('account-modal').classList.add('flex');
}

async function handleDeleteAccount(id) {
    if (!confirm("Hapus akun ini?")) return;
    showLoading(true);
    try {
        await deleteAccount(id);
        await loadAccountPage();
        showToast("Akun dihapus", "success");
    } catch (error) {
        showToast("Gagal hapus akun", "error");
    } finally {
        showLoading(false);
    }
}

// Profit Actions
async function handleDeleteProfit(id) {
    if (!confirm("Hapus data profit ini?")) return;
    showLoading(true);
    try {
        await deleteProfit(id);
        await loadProfitPage();
        showToast("Data profit dihapus", "success");
    } catch (error) {
        showToast("Gagal hapus profit", "error");
    } finally {
        showLoading(false);
    }
}

async function handleDeleteExpense(id) {
    if (!confirm("Hapus data pengeluaran ini?")) return;
    showLoading(true);
    try {
        await deleteExpense(id);
        await loadProfitPage();
        showToast("Data pengeluaran dihapus", "success");
    } catch (error) {
        showToast("Gagal hapus pengeluaran", "error");
    } finally {
        showLoading(false);
    }
}

// Infinite Scroll for Accounts
let scrollListener = null;

function setupAccountInfiniteScroll() {
    // Remove previous listener if exists
    if (scrollListener) {
        window.removeEventListener('scroll', scrollListener);
    }

    // Create new scroll listener
    scrollListener = function () {
        // Check if we're on the account page
        const accountPage = document.getElementById('account-page');
        if (!accountPage || accountPage.classList.contains('hidden')) return;

        // Check if user scrolled near bottom (within 200px)
        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.documentElement.scrollHeight;

        if (scrollPosition >= pageHeight - 200) {
            // Load next page if available and not currently loading
            if (hasMoreAccounts && !isLoadingAccounts) {
                loadAccountPage(currentAccountPage + 1, true); // true = append
            }
        }
    };

    window.addEventListener('scroll', scrollListener);
}

async function showPage(pageId) {
    try {
        if (pageId === 'admin') {
            const user = await getUser();
            if (!user) {
                showLoginModal();
                return;
            }
        }

        // Hide all pages
        const pages = ['user', 'admin', 'account', 'profit'];
        pages.forEach(p => {
            const el = document.getElementById(p + '-page');
            if (el) el.classList.add('hidden');
        });

        // Show target page
        const target = document.getElementById(pageId + '-page');
        if (target) target.classList.remove('hidden');

        // Update URL
        const url = new URL(window.location);

        if (pageId === 'user') {
            url.searchParams.delete('page');
        } else {
            url.searchParams.set('page', pageId);
        }

        // Preserve admin param if present
        const currentParams = new URLSearchParams(window.location.search);
        if (currentParams.get('admin') === '1') {
            url.searchParams.set('admin', '1');
        }

        window.history.pushState({ page: pageId }, '', url);

        // Check Admin Param for Button Visibility (Dynamic Update)
        const hasAdminParam = url.searchParams.get('admin') === '1';
        const displayStyle = hasAdminParam ? 'block' : 'none';

        const adminButton = document.getElementById('admin-btn');
        const accountButton = document.getElementById('account-btn');
        const profitButton = document.getElementById('profit-btn');
        const logoutButton = document.getElementById('nav-logout-btn');

        if (adminButton) adminButton.style.display = displayStyle;
        if (accountButton) accountButton.style.display = displayStyle;
        if (profitButton) profitButton.style.display = displayStyle;
        if (logoutButton) logoutButton.style.display = displayStyle;

        // Update Button States
        const btnMap = {
            'user': 'user-btn',
            'account': 'account-btn',
            'profit': 'profit-btn',
            'admin': 'admin-btn'
        };

        // Text Buttons (Dashboard, Account, Profit)
        const commonInactive = "text-gray-600 hover:text-blue-600 bg-transparent hover:bg-blue-50";
        const commonActive = "bg-blue-100 text-blue-700 shadow-sm";

        Object.keys(btnMap).forEach(key => {
            const btnId = btnMap[key];
            const btn = document.getElementById(btnId);
            if (!btn) return;

            if (key === 'admin') {
                // Special styling for Admin button
                if (key === pageId) {
                    btn.classList.add('ring-4', 'ring-gray-200', 'bg-gray-800');
                    btn.classList.remove('bg-gray-900');
                } else {
                    btn.classList.remove('ring-4', 'ring-gray-200', 'bg-gray-800');
                    btn.classList.add('bg-gray-900');
                }
            } else {
                // Standard Tabs
                if (key === pageId) {
                    // Apply Active
                    btn.className = `px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all transform scale-105 ${commonActive}`;
                } else {
                    // Apply Inactive
                    btn.className = `px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors ${commonInactive}`;
                }
            }
        });

        // Load Data
        if (pageId === 'user') refreshData();
        if (pageId === 'admin') loadAdminTablePage(1);
        if (pageId === 'account') {
            // Reset infinite scroll state
            currentAccountPage = 1;
            hasMoreAccounts = true;
            loadAccountPage(1, false); // Initial load

            // Setup infinite scroll listener
            setupAccountInfiniteScroll();
        }
        if (pageId === 'profit') loadProfitPage();

    } catch (error) {
        console.error("Error in showPage:", error);
        alert("Terjadi kesalahan saat memuat halaman: " + error.message);
    }
}

function showLoginModal() {
    document.getElementById('login-modal').classList.remove('hidden');
    document.getElementById('login-modal').classList.add('flex');
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('login-modal').classList.remove('flex');
    document.getElementById('login-form').reset();
}

async function handleLogout() {
    try {
        await logout();
        localStorage.removeItem('stockinsight_admin_enabled'); // Clear session
        showToast("Logout berhasil", "success");
        setTimeout(() => {
            window.location.reload(); // Reload to trigger auth check
        }, 500);
    } catch (error) {
        console.error("Logout error:", error);
        showToast("Gagal logout", "error");
    }
}

// --- EVENT LISTENERS ---

// Search & Filter
let searchTimeout;
window.handleSearch = function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        loadTablePage(1);
    }, 500);
};

let adminSearchTimeout;
window.handleAdminSearch = function () {
    clearTimeout(adminSearchTimeout);
    adminSearchTimeout = setTimeout(() => {
        loadAdminTablePage(1);
    }, 500);
};

// Login Form Submit
document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = document.getElementById('btn-login');
    const originalText = btn.innerText;
    btn.innerText = "Login...";
    btn.disabled = true;

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await login(email, password);
        closeLoginModal();
        showToast("Login berhasil!", "success");

        // Enable Admin Mode
        localStorage.setItem('stockinsight_admin_enabled', 'true');

        // Show Admin Buttons
        document.getElementById('admin-btn').style.display = 'block';
        document.getElementById('account-btn').style.display = 'block';
        document.getElementById('profit-btn').style.display = 'block';

        // Redirect to Dashboard first as requested
        refreshData();
        showPage('user');
    } catch (error) {
        console.error("Login error:", error);
        showToast("Login gagal: " + error.message, "error");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});

// Stock Form Submit
document.getElementById('inputForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    showLoading(true);
    const btn = document.getElementById('btn-submit');
    const originalText = btn.innerText;
    btn.innerText = "Menyimpan...";
    btn.disabled = true;

    try {
        const id = document.getElementById('edit-id').value;
        const newStock = {
            code: document.getElementById('code').value.toUpperCase(),
            date: document.getElementById('date').value,
            uw: document.getElementById('uw').value.toUpperCase(),
            float: parseFloat(document.getElementById('float').value) || 0,
            d1: parseFloat(document.getElementById('d1').value) || 0,
            d2: parseFloat(document.getElementById('d2').value) || 0,
            d3: parseFloat(document.getElementById('d3').value) || 0,
            d4: parseFloat(document.getElementById('d4').value) || 0,
            d5: parseFloat(document.getElementById('d5').value) || 0,
            d6: parseFloat(document.getElementById('d6').value) || 0,
            d7: parseFloat(document.getElementById('d7').value) || 0,
        };

        if (id) newStock.id = id;

        // Duplicate Check
        const isDuplicate = await checkDuplicateStock(newStock.code, id);
        if (isDuplicate) {
            showToast(`Kode Saham ${newStock.code} sudah ada!`, "error");
            showLoading(false);
            btn.innerText = originalText;
            btn.disabled = false;
            return;
        }

        await upsertStock(newStock);

        await refreshData();
        await loadAdminTablePage(adminCurrentPage);

        cancelEdit(); // Reset form
        showToast("Data berhasil disimpan!", "success");
    } catch (error) {
        console.error("Error saving data:", error);
        showToast("Gagal menyimpan data: " + error.message, "error");
    } finally {
        btn.innerText = originalText;
        if (btn.innerText === "Menyimpan...") btn.innerText = "Simpan ke Database";
        btn.disabled = false;
        showLoading(false);
    }
});

// Account Form Submit
document.getElementById('accountForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    showLoading(true);
    const btn = document.getElementById('btn-save-account');
    const originalText = btn.innerText;
    btn.innerText = "Processing...";
    btn.disabled = true;

    try {
        const id = document.getElementById('account-id').value;
        const data = {
            name: document.getElementById('acc-name').value,
            email: document.getElementById('acc-email').value,
            phone: document.getElementById('acc-phone').value,
            rdn: document.getElementById('acc-rdn').value,
            device_user: document.getElementById('acc-device').value,
            entry_number: parseInt(document.getElementById('acc-entry').value) || 0
        };

        if (id) data.id = id;

        // Check for duplicate email
        if (data.email) {
            const isDuplicateEmail = await checkDuplicateEmail(data.email, id);
            if (isDuplicateEmail) {
                showToast("Akun dengan email ini sudah ada!", "error");
                showLoading(false);
                btn.innerText = originalText;
                btn.disabled = false;
                return;
            }
        }

        await upsertAccount(data);
        await loadAccountPage(1, false); // Reload from page 1
        closeAccountModal();
        showToast("Akun berhasil disimpan", "success");
    } catch (error) {
        console.error("Account save error:", error);
        showToast("Gagal simpan akun", "error");
    } finally {
        showLoading(false);
        btn.innerText = originalText;
        btn.disabled = false;
    }
});

// Profit Form Submit
document.getElementById('profitForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    showLoading(true);

    try {
        const data = {
            stock_name: document.getElementById('profit-stock').value.toUpperCase(),
            profit_amount: parseFloat(document.getElementById('profit-amount').value)
        };

        await upsertProfit(data);
        await loadProfitPage();
        document.getElementById('profitForm').reset();
        showToast("Profit ditambahkan", "success");
    } catch (error) {
        showToast("Gagal tambah profit", "error");
    } finally {
        showLoading(false);
    }
});

// Expense Form Submit
document.getElementById('expenseForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    showLoading(true);

    try {
        const data = {
            description: document.getElementById('expense-desc').value,
            expense_type: document.getElementById('expense-type').value,
            amount: parseFloat(document.getElementById('expense-amount').value)
        };

        await upsertExpense(data);
        await loadProfitPage();
        document.getElementById('expenseForm').reset();
        showToast("Pengeluaran ditambahkan", "success");
    } catch (error) {
        showToast("Gagal tambah pengeluaran", "error");
    } finally {
        showLoading(false);
    }
});

// Expose to Window for HTML onclick
window.loadTablePage = loadTablePage;
window.loadAdminTablePage = loadAdminTablePage;
window.loadAccountPage = loadAccountPage;
window.refreshData = refreshData;
window.showPage = showPage;
window.editStock = handleEditStock;
window.deleteStock = handleDeleteStock;
window.cancelEdit = cancelEdit;

window.editAccount = handleEditAccount;
window.deleteAccount = handleDeleteAccount;
window.openAccountModal = openAccountModal;
window.closeAccountModal = closeAccountModal;
window.filterAccounts = filterAccounts;
window.deleteProfit = handleDeleteProfit;
window.deleteExpense = handleDeleteExpense;

window.openTopUWModal = () => openTopUWModal(globalStocks);
window.closeTopUWModal = closeTopUWModal;
window.openUWDetailModal = (uwName) => openUWDetailModal(uwName, globalStocks);
window.closeUWDetailModal = closeUWDetailModal;
window.closeLoginModal = closeLoginModal;
window.handleLogout = handleLogout;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check admin visibility
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');

    // Show/hide admin button based on localStorage AND URL param
    const isAdminEnabled = localStorage.getItem('stockinsight_admin_enabled') === 'true';
    const hasAdminParam = adminParam === '1' || adminParam === 'true';

    const adminButton = document.getElementById('admin-btn');
    const accountButton = document.getElementById('account-btn');
    const profitButton = document.getElementById('profit-btn');
    const logoutButton = document.getElementById('nav-logout-btn');

    // ONLY show admin tabs if logged in AND ?admin=1 is present
    const displayStyle = (isAdminEnabled && hasAdminParam) ? 'block' : 'none';

    if (adminButton) adminButton.style.display = displayStyle;
    if (accountButton) accountButton.style.display = displayStyle;
    if (profitButton) profitButton.style.display = displayStyle;

    // Logout button uses same rules as other admin buttons
    if (logoutButton) logoutButton.style.display = displayStyle;

    // AUTH CHECK LOGIC
    if (hasAdminParam) {
        if (!isAdminEnabled) {
            // Admin URL but not logged in? Show modal & Stop
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                loginModal.classList.remove('hidden');
                loginModal.classList.add('flex');
            }
            return;
        }
    }

    // Router Logic
    const pageParam = urlParams.get('page');
    if (pageParam && pages.includes(pageParam)) {
        showPage(pageParam);
    } else if (hasAdminParam && isAdminEnabled) {
        // User requesting admin mode but no specific page -> Default to Dashboard
        showPage('user');
    } else {
        // Default Public Access -> Dashboard
        showPage('user');
    }

    // Handle Browser Back Button
    window.addEventListener('popstate', (event) => {
        const page = event.state?.page || 'user';
        showPage(page);
    });
});

