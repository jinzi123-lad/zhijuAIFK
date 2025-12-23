// 财务报表页面
const { supabase } = require('../../../utils/supabase');

// 获取房东UUID
function getLandlordUuid() {
    return wx.getStorageSync('landlord_uuid') || '11111111-1111-1111-1111-111111111111';
}

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
        collectRate: 0,
        recentPayments: [],
        loading: true
    },

    onLoad() {
        this.fetchFinancialData();
    },

    onShow() {
        this.fetchFinancialData();
    },

    onPullDownRefresh() {
        this.fetchFinancialData().then(() => {
            wx.stopPullDownRefresh();
        });
    },

    setPeriod(e) {
        const period = e.currentTarget.dataset.period;
        this.setData({ selectedPeriod: period });
        this.fetchFinancialData();
    },

    viewAllPayments() {
        wx.showToast({ title: '查看全部账单', icon: 'none' });
    },

    async fetchFinancialData() {
        const landlordUuid = getLandlordUuid();
        this.setData({ loading: true });

        try {
            // 1. 从contracts表获取收入
            const { data: contracts } = await supabase
                .from('contracts')
                .select('id, rent_amount, tenant_name, property_title, status')
                .eq('landlord_id', landlordUuid)
                .exec();

            let totalMonthlyRent = 0;
            const activeContracts = [];

            if (contracts) {
                contracts.forEach(c => {
                    if (c.status === 'active' || c.status === 'signed') {
                        totalMonthlyRent += (c.rent_amount || 0);
                        activeContracts.push(c);
                    }
                });
            }

            // 2. 从payments表获取账单
            const { data: payments } = await supabase
                .from('payments')
                .select('id, amount, payment_type, status, due_date, paid_date, property_id')
                .eq('landlord_id', landlordUuid)
                .order('created_at', { ascending: false })
                .limit(10)
                .exec();

            let paidAmount = 0;
            let totalDueAmount = 0;
            const recentPayments = [];

            if (payments) {
                payments.forEach(p => {
                    totalDueAmount += (p.amount || 0);
                    if (p.status === 'paid' || p.status === 'confirmed') {
                        paidAmount += (p.amount || 0);
                    }
                    recentPayments.push({
                        id: p.id,
                        propertyId: p.property_id,
                        amount: (p.amount || 0).toLocaleString(),
                        typeLabel: p.payment_type === 'rent' ? '租金' : (p.payment_type === 'deposit' ? '押金' : '其他'),
                        status: p.status,
                        statusLabel: p.status === 'paid' ? '已支付' : (p.status === 'overdue' ? '已逾期' : '待支付'),
                        statusClass: p.status === 'paid' ? 'badge-success' : (p.status === 'overdue' ? 'badge-error' : 'badge-warning'),
                        dueDate: p.due_date
                    });
                });
            }

            // 如果没有payments但有合同，生成预期账单展示
            if (recentPayments.length === 0 && activeContracts.length > 0) {
                activeContracts.slice(0, 5).forEach((c, index) => {
                    recentPayments.push({
                        id: index,
                        propertyId: c.property_title,
                        amount: (c.rent_amount || 0).toLocaleString(),
                        typeLabel: '租金',
                        status: 'pending',
                        statusLabel: '待支付',
                        statusClass: 'badge-warning',
                        dueDate: new Date().toISOString().split('T')[0]
                    });
                });
            }

            const collectRate = totalDueAmount > 0 ? Math.round((paidAmount / totalDueAmount) * 100) : 0;
            const totalExpense = Math.round(totalMonthlyRent * 0.15);
            const netProfit = totalMonthlyRent - totalExpense;

            this.setData({
                financialSummary: {
                    totalIncome: totalMonthlyRent.toLocaleString(),
                    totalExpense: totalExpense.toLocaleString(),
                    netProfit: netProfit.toLocaleString(),
                    incomeGrowth: 0,
                    expenseGrowth: 0,
                    profitGrowth: 0,
                },
                collectRate,
                recentPayments,
                loading: false
            });
        } catch (err) {
            console.error('获取财务数据失败', err);
            this.setData({ loading: false });
        }
    },

    goAddTenant() {
        wx.navigateTo({ url: '/pages/landlord/tenant/add/index' });
    },

    goProperties() {
        wx.navigateTo({ url: '/pages/landlord/property/list/index' });
    }
})
