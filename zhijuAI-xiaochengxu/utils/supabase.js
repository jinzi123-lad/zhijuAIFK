// utils/supabase.js
const SUPABASE_URL = 'https://jftfuycsttqinerhqoqw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmdGZ1eWNzdHRxaW5lcmhxb3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTM4NzAsImV4cCI6MjA4MTQ2OTg3MH0.DBWbecOPHJAE7p8BHFnFIsU4QhcAI8UyeoKKeZG6k7M';

/**
 * A lightweight Supabase REST client for WeChat Mini Program
 */
class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.headers = {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation' // Return data after op
        };
    }

    from(table) {
        return new QueryBuilder(this.url, table, this.headers);
    }
}

class QueryBuilder {
    constructor(baseUrl, table, headers) {
        this.url = `${baseUrl}/rest/v1/${table}`;
        this.headers = headers;
        this.params = [];
        this.method = 'GET';
        this.body = null;
    }

    // Filters
    select(columns = '*') {
        this.method = 'GET';
        this.params.push(`select=${columns}`);
        return this;
    }

    eq(column, value) {
        this.params.push(`${column}=eq.${value}`);
        return this;
    }

    neq(column, value) {
        this.params.push(`${column}=neq.${value}`);
        return this;
    }

    gt(column, value) {
        this.params.push(`${column}=gt.${value}`);
        return this;
    }

    lt(column, value) {
        this.params.push(`${column}=lt.${value}`);
        return this;
    }

    order(column, { ascending = true } = {}) {
        this.params.push(`order=${column}.${ascending ? 'asc' : 'desc'}`);
        return this;
    }

    limit(count) {
        // Range header is usually better for pagination but limit param works in some contexts
        // Supabase standard is Offset/Limit via Range header usually, or limit param?
        // Let's use Range header for pagination ideally, but limit param works too
        this.headers['Range'] = `0-${count - 1}`;
        return this;
    }

    range(from, to) {
        this.headers['Range'] = `${from}-${to}`;
        return this;
    }

    // Modifiers
    insert(data) {
        this.method = 'POST';
        this.body = data;
        return this;
    }

    update(data) {
        this.method = 'PATCH';
        this.body = data;
        return this;
    }

    delete() {
        this.method = 'DELETE';
        return this;
    }

    // Execute
    then(resolve, reject) {
        this.exec().then(resolve).catch(reject);
    }

    async exec() {
        let finalUrl = this.url;
        if (this.params.length > 0) {
            finalUrl += '?' + this.params.join('&');
        }

        return new Promise((resolve, reject) => {
            wx.request({
                url: finalUrl,
                method: this.method,
                header: this.headers,
                data: this.body,
                success: (res) => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ data: res.data, error: null, count: null }); // TODO: Handle count
                    } else {
                        console.error('Supabase Error:', res);
                        resolve({ data: null, error: res.data || res.statusCode });
                    }
                },
                fail: (err) => {
                    console.error('Network Error:', err);
                    resolve({ data: null, error: err });
                }
            });
        });
    }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = {
    supabase
};
