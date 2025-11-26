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
