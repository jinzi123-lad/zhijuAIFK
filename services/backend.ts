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
    }
};
