import { supabase, ITEMS_PER_PAGE } from '../config.js';

export async function fetchGlobalStocks() {
    const { data, error } = await supabase.from('stocks').select('*');
    if (error) throw error;
    return data || [];
}

export async function fetchStocks(page, search, uwFilter) {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    let query = supabase.from('stocks').select('*', { count: 'exact' });

    if (search) query = query.ilike('code', `%${search}%`);
    if (uwFilter) query = query.eq('uw', uwFilter);

    query = query.range(start, end).order('date', { ascending: false });

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], count: count || 0 };
}

export async function fetchAdminStocks(page, search) {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    let query = supabase.from('stocks').select('*', { count: 'exact' });

    if (search) query = query.ilike('code', `%${search}%`);

    query = query.range(start, end).order('date', { ascending: false });

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], count: count || 0 };
}

export async function checkDuplicateStock(code, excludeId = null) {
    let query = supabase.from('stocks').select('id').eq('code', code);
    if (excludeId) {
        query = query.neq('id', excludeId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data && data.length > 0;
}

export async function upsertStock(stockData) {
    const { data, error } = await supabase.from('stocks').upsert(stockData).select();
    if (error) throw error;
    return data;
}

export async function deleteStockById(id) {
    const { error } = await supabase.from('stocks').delete().eq('id', id);
    if (error) throw error;
    return true;
}

// --- ACCOUNTS API ---

export async function fetchAccounts(page = 1, limit = 9, filterDevice = null, searchQuery = '') { // Default limit 9 for grid 3x
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = supabase
        .from('accounts')
        .select('*', { count: 'exact' });

    if (filterDevice) {
        query = query.eq('device_user', filterDevice);
    }

    if (searchQuery) {
        // Search across name, email, phone (case-insensitive)
        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
    }

    query = query.order('entry_number', { ascending: true })
        .range(start, end);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], count: count || 0 };
}

export async function fetchAccountDevices() {
    // Fetch unique device_user values
    // Note: Supabase doesn't have a direct 'distinct' helper on select easily without a weird syntax or rpc.
    // Standard way: select('device_user') then JS set, but validation rules might blocking duplicate huge data.
    // Efficient way: .select('device_user') and process in JS (if data is small) OR .rpc() if we hade a function.
    // Given the scale, fetch all device_user strings is fine.

    const { data, error } = await supabase
        .from('accounts')
        .select('device_user');

    if (error) throw error;

    // Process unique in JS
    const unique = [...new Set(data.map(item => item.device_user).filter(Boolean))];
    return unique.sort();
}

export async function checkDuplicateEmail(email, excludeId = null) {
    if (!email) return false; // Empty email is allowed

    let query = supabase.from('accounts').select('id, email').ilike('email', email);
    if (excludeId) {
        query = query.neq('id', excludeId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data && data.length > 0;
}

export async function upsertAccount(accountData) {
    const { data, error } = await supabase
        .from('accounts')
        .upsert(accountData)
        .select();
    if (error) throw error;
    return data;
}

export async function deleteAccount(id) {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) throw error;
    return true;
}

// --- PROFIT & EXPENSES API ---

export async function fetchProfits() {
    const { data, error } = await supabase
        .from('profits')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function upsertProfit(profitData) {
    const { data, error } = await supabase
        .from('profits')
        .upsert(profitData)
        .select();
    if (error) throw error;
    return data;
}

export async function deleteProfit(id) {
    const { error } = await supabase.from('profits').delete().eq('id', id);
    if (error) throw error;
    return true;
}

export async function fetchExpenses() {
    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function upsertExpense(expenseData) {
    const { data, error } = await supabase
        .from('expenses')
        .upsert(expenseData)
        .select();
    if (error) throw error;
    return data;
}

export async function deleteExpense(id) {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
    return true;
}
