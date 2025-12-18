/// <reference types="vite/client" />
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://zhiju-backend.vercel.app';

export interface DashboardStats {
    totalGMV: number;
    todayViewings: number;
    activeUsers: number;
    conversionFunnel: { label: string; count: number; color: string }[];
    topAgents: { name: string; count: number; area: string }[];
}

export const backendApi = {
    getDashboardStats: async (): Promise<DashboardStats | null> => {
        try {
            const res = await fetch(`${BACKEND_URL}/dashboard/stats`);
            if (!res.ok) throw new Error('API Error');
            return await res.json();
        } catch (e) {
            console.warn('Backend API failed, falling back to local calculation:', e);
            return null;
        }
    },
    chatProxy: async (message: string, context?: string): Promise<string> => {
        try {
            const res = await fetch(`${BACKEND_URL}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: context || 'You are a helpful AI assistant for a smart home system.' },
                        { role: 'user', content: message }
                    ]
                })
            });
            if (!res.ok) throw new Error('Backend AI Error');
            const data = await res.json();
            // Compatible with OpenAI format response
            return data.choices?.[0]?.message?.content || data.response || 'AI No Response';
        } catch (e) {
            console.error('Backend AI Proxy Failed:', e);
            throw e;
        }
    }
};
