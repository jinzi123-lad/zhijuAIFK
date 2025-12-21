import { createClient } from '@supabase/supabase-js';

// 获取环境变量的辅助函数 (兼容 Vite 和标准环境)
const getEnv = (key: string) => {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        return import.meta.env[`VITE_${key}`] || import.meta.env[key];
    }
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
        // @ts-ignore
        return process.env[key];
    }
    return '';
};

// 你需要在 Vercel 或 .env 文件中设置这两个变量
// VITE_SUPABASE_URL: 你的 Supabase 项目 URL (Project Settings -> API)
// VITE_SUPABASE_KEY: 你的 Supabase anon public key
const envUrl = getEnv('SUPABASE_URL');
const envKey = getEnv('SUPABASE_KEY');

// 防止因缺少环境变量导致应用崩溃 (使用占位符)
// 这样即使没有配置 Supabase，应用也能启动（会进入 db.ts 的错误处理逻辑并使用 Mock 数据）
const supabaseUrl = envUrl || 'https://placeholder-project.supabase.co';
const supabaseKey = envKey || 'placeholder-key';

if (!envUrl || !envKey) {
    console.warn('⚠️ Supabase 环境变量未设置 (VITE_SUPABASE_URL, VITE_SUPABASE_KEY)。系统将运行在演示模式 (Mock Mode)。');
}

export const supabase = createClient(supabaseUrl, supabaseKey);