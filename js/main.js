console.log("Main.js loading...");
import { fetchGlobalStocks, fetchStocks, fetchAdminStocks, checkDuplicateStock, upsertStock, deleteStockById } from './services/api.js';
import { showLoading, renderTableRows, renderPaginationControls, renderAdminTableRows, renderAdminPaginationControls, updateDashboardStats, renderTopUWSection, populateUWFilter, openTopUWModal, closeTopUWModal, openUWDetailModal, closeUWDetailModal } from './ui/renderers.js';
import { showToast } from './ui/toast.js';
import { login, logout, getUser } from './auth.js';

// --- STATE ---
let globalStocks = [];
let currentPage = 1;
let adminCurrentPage = 1;
let currentAdminData = []; // Needed for editStock to access data by index

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

async function loadTablePage(page) {
    showLoading(true);
    currentPage = page;
    const search = document.getElementById('searchBox').value;
    const uwFilter = document.getElementById('uwFilter').value;

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

async function showPage(pageId) {
    try {
        if (pageId === 'admin') {
            const user = await getUser();
            if (!user) {
                showLoginModal();
                return;
            }
        }

        document.getElementById('user-page').classList.add('hidden');
        document.getElementById('admin-page').classList.add('hidden');
        document.getElementById(pageId + '-page').classList.remove('hidden');

        if (pageId === 'user') refreshData();
        if (pageId === 'admin') {
            loadAdminTablePage(1);
        }
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
        showToast("Logout berhasil", "success");
        showPage('user');
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
        showPage('admin');
    } catch (error) {
        console.error("Login error:", error);
        showToast("Login gagal: " + error.message, "error");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});

// Form Submit
document.getElementById('inputForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    showLoading(true);
    const btn = document.getElementById('btn-submit');
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
            btn.innerText = "Simpan ke Database";
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
        btn.innerText = "Simpan ke Database";
        btn.disabled = false;
        showLoading(false);
    }
});

// Expose to Window for HTML onclick
window.loadTablePage = loadTablePage;
window.loadAdminTablePage = loadAdminTablePage;
window.refreshData = refreshData;
window.showPage = showPage;
window.editStock = handleEditStock;
window.deleteStock = handleDeleteStock;
window.cancelEdit = cancelEdit;
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

    // If ?admin=1 in URL, enable admin and save to localStorage
    if (adminParam === '1' || adminParam === 'true') {
        localStorage.setItem('stockinsight_admin_enabled', 'true');
    }

    // Show/hide admin button based on localStorage
    const isAdminEnabled = localStorage.getItem('stockinsight_admin_enabled') === 'true';
    const adminButton = document.getElementById('admin-btn');
    if (adminButton) {
        adminButton.style.display = isAdminEnabled ? 'block' : 'none';
    }

    refreshData();
});
