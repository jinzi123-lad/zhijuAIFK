const { supabase } = require('../../../utils/supabase');

Page({
    data: {
        selectedPeriod: 'month',
        financialSummary: {
            totalIncome: '0',
            totalExpense: '0',
            netProfit: '0',
            incomeGrowth: 0,
            expenseGrowth: 0,
            profitGrowth: 0,
        },
        monthlyRevenue: [
            // Mock chart data kept for visual fullness until we have historical payment records
            { month: "7月", income: '38,000', percent: 80 },
            { month: "8月", income: '39,500', percent: 83 },
            { month: "9月", income: '41,000', percent: 85 },
            { month: "10月", income: '42,800', percent: 88 },
            { month: "11月", income: '44,200', percent: 92 },
            { month: "12月", income: '45,600', percent: 100 },
        ],
        recentPayments: []
    },

    onLoad() {
        this.fetchFinancialData();
    },

    onPullDownRefresh() {
        this.fetchFinancialData().then(() => {
            wx.stopPullDownRefresh();
        });
    },

    setPeriod(e) {
        this.setData({ selectedPeriod: e.currentTarget.dataset.period });
    },

    viewAllPayments() {
        wx.showToast({ title: '查看全部账单', icon: 'none' });
    },

    async fetchFinancialData() {
        // 1. Calculate Expected Monthly Revenue from Active Tenants
        // In a real system, we'd query a 'transactions' table.
        // For MVP, we sum 'rent_amount' from 'tenants' table (PROJECTION).

        const landlordId = getApp().globalData.landlordId;
        const { data: tenants, error } = await supabase
            .from('tenants')
            .select('rent_amount, name, property_name, contract_end_date')
            .eq('status', 'active')
            .eq('landlord_id', landlordId)
            .exec();

        if (error) {
            console.error('Fetch finance data failed', error);
            return;
        }

        const activeTenants = tenants || [];
        let totalMonthlyRent = 0;

        // Mock recent payments list from real tenants
        const mockRecentPayments = activeTenants.map((t, index) => ({
            id: index,
            propertyId: t.property_name, // Simplified
            amount: t.rent_amount.toString(),
            typeLabel: "租金",
            status: index % 3 === 0 ? "paid" : (index % 5 === 0 ? "overdue" : "pending"), // Random status for demo
            statusLabel: index % 3 === 0 ? "已支付" : (index % 5 === 0 ? "已逾期" : "待支付"),
            statusClass: index % 3 === 0 ? "badge-success" : (index % 5 === 0 ? "badge-error" : "badge-warning"),
            dueDate: new Date().toISOString().split('T')[0] // Today
        }));

        activeTenants.forEach(t => {
            totalMonthlyRent += (t.rent_amount || 0);
        });

        // Mock Expense (fix calculated 20% of income)
        const totalExpense = totalMonthlyRent * 0.2;
        const netProfit = totalMonthlyRent - totalExpense;

        this.setData({
            financialSummary: {
                totalIncome: totalMonthlyRent.toLocaleString(),
                totalExpense: totalExpense.toLocaleString(),
                netProfit: netProfit.toLocaleString(),
                incomeGrowth: 12.5, // Mock
                expenseGrowth: 3.2, // Mock
                profitGrowth: 15.8, // Mock
            },
            recentPayments: mockRecentPayments
        });
    }
})
