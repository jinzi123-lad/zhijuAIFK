import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
    async getStats() {
        // In real app, connect to Supabase here
        return {
            totalGMV: 1258888,
            todayViewings: 42,
            activeUsers: 340,
            conversionFunnel: [
                { label: '客源总数', count: 1200, color: 'bg-blue-600' },
                { label: '意向客户', count: 800, color: 'bg-indigo-600' },
                { label: '本月带看', count: 450, color: 'bg-violet-600' },
                { label: '本月成交', count: 85, color: 'bg-fuchsia-600' },
            ],
            topAgents: [
                { name: '王牌销售', count: 28, area: '朝阳区' },
                { name: '李销冠', count: 25, area: '海淀区' }
            ]
        };
    }
}
