// 租客详情页
const { supabase } = require('../../../../utils/supabase');

Page({
    data: {
        loading: true,
        tenantId: '',
        tenant: null,
        bills: []
    },

    onLoad(options) {
        if (options.id) {
            this.setData({ tenantId: options.id });
            this.loadTenantDetail(options.id);
        } else {
            wx.showToast({ title: '参数错误', icon: 'none' });
            setTimeout(() => wx.navigateBack(), 1500);
        }
    },

    async loadTenantDetail(contractId) {
        const landlordUuid = wx.getStorageSync('landlord_uuid') || '11111111-1111-1111-1111-111111111111';

        try {
            // 从合同表获取租客详情
            const { data: contracts, error } = await supabase
                .from('contracts')
                .select('*')
                .eq('id', contractId)
                .exec();

            if (error || !contracts || contracts.length === 0) {
                wx.showToast({ title: '租客信息不存在', icon: 'none' });
                this.setData({ loading: false });
                return;
            }

            const contract = contracts[0];

            // 计算到期状态
            let statusText = '在租';
            let statusClass = 'active';
            const now = new Date();
            const endDate = new Date(contract.end_date);
            const daysToExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

            if (daysToExpiry < 0) {
                statusText = '已到期';
                statusClass = 'expired';
            } else if (daysToExpiry <= 30) {
                statusText = `${daysToExpiry}天后到期`;
                statusClass = 'expiring';
            }

            const tenant = {
                id: contract.id,
                contractId: contract.id.substring(0, 8).toUpperCase(),
                name: contract.tenant_name || '租客',
                phone: contract.tenant_phone || '',
                property: contract.property_title || contract.property_address || '未知房源',
                rent: contract.rent_amount || 0,
                deposit: contract.deposit_amount || 0,
                startDate: contract.start_date,
                endDate: contract.end_date,
                paymentDay: contract.payment_day || 5,
                statusText,
                statusClass,
                isExpiringSoon: daysToExpiry > 0 && daysToExpiry <= 30
            };

            this.setData({ tenant, loading: false });

            // 加载账单记录
            this.loadBills(contract.id);
        } catch (err) {
            console.error('加载租客详情失败', err);
            wx.showToast({ title: '加载失败', icon: 'none' });
            this.setData({ loading: false });
        }
    },

    async loadBills(contractId) {
        try {
            const { data: payments } = await supabase
                .from('payments')
                .select('*')
                .eq('contract_id', contractId)
                .range(0, 19)
                .order('due_date', { ascending: false })
                .exec();

            const typeMap = {
                'rent': '租金',
                'deposit': '押金',
                'utility': '水电费',
                'other': '其他'
            };

            const bills = (payments || []).map(p => ({
                id: p.id,
                typeLabel: typeMap[p.payment_type] || '租金',
                amount: p.amount || 0,
                dueDate: p.due_date,
                status: p.status,
                statusLabel: p.status === 'paid' ? '已付' : (p.status === 'overdue' ? '逾期' : '待付'),
                statusClass: p.status === 'paid' ? 'paid' : (p.status === 'overdue' ? 'overdue' : 'pending')
            }));

            this.setData({ bills });
        } catch (err) {
            console.error('加载账单失败', err);
        }
    },

    // 拨打电话
    callTenant() {
        const phone = this.data.tenant?.phone;
        if (phone) {
            wx.makePhoneCall({ phoneNumber: phone });
        } else {
            wx.showToast({ title: '暂无联系方式', icon: 'none' });
        }
    },

    // 查看合同
    goToContract() {
        const contractId = this.data.tenantId;
        wx.navigateTo({
            url: `/pages/landlord/contract/detail/index?id=${contractId}`
        });
    },

    // 续租
    renewContract() {
        const { tenant } = this.data;
        if (!tenant) return;

        wx.showActionSheet({
            itemList: ['续租6个月', '续租1年', '续租2年', '自定义期限'],
            success: async (res) => {
                let months = 12;
                if (res.tapIndex === 0) months = 6;
                else if (res.tapIndex === 1) months = 12;
                else if (res.tapIndex === 2) months = 24;
                else if (res.tapIndex === 3) {
                    // 自定义期限，显示输入框
                    this.showCustomRenewInput();
                    return;
                }

                await this.doRenewContract(months);
            }
        });
    },

    showCustomRenewInput() {
        // 微信小程序没有直接的输入弹窗，使用模态框+提示
        wx.showModal({
            title: '自定义续租期限',
            content: '请输入续租月数（1-36个月）',
            editable: true,
            placeholderText: '12',
            success: async (res) => {
                if (res.confirm && res.content) {
                    const months = parseInt(res.content);
                    if (months > 0 && months <= 36) {
                        await this.doRenewContract(months);
                    } else {
                        wx.showToast({ title: '请输入1-36之间的数字', icon: 'none' });
                    }
                }
            }
        });
    },

    async doRenewContract(months) {
        const { tenant, tenantId } = this.data;

        wx.showLoading({ title: '续租处理中...' });

        try {
            // 计算新的结束日期
            const currentEndDate = new Date(tenant.endDate);
            const newEndDate = new Date(currentEndDate);
            newEndDate.setMonth(newEndDate.getMonth() + months);
            const newEndDateStr = newEndDate.toISOString().split('T')[0];

            // 更新合同结束日期
            const { error } = await supabase
                .from('contracts')
                .update({
                    end_date: newEndDateStr,
                    status: 'active'
                })
                .eq('id', tenantId)
                .exec();

            if (error) throw error;

            wx.hideLoading();
            wx.showModal({
                title: '续租成功',
                content: `合同已续租${months}个月，新到期日：${newEndDateStr}`,
                showCancel: false,
                success: () => {
                    // 刷新页面数据
                    this.loadTenantDetail(tenantId);
                }
            });
        } catch (err) {
            console.error('续租失败', err);
            wx.hideLoading();
            wx.showToast({ title: '续租失败，请重试', icon: 'none' });
        }
    },

    // 退租
    terminateContract() {
        const { tenant } = this.data;
        if (!tenant) return;

        wx.showActionSheet({
            itemList: ['立即退租（今天生效）', '预约退租（选择退租日期）'],
            success: (res) => {
                if (res.tapIndex === 0) {
                    this.confirmTerminate(new Date().toISOString().split('T')[0]);
                } else {
                    this.showTerminateDatePicker();
                }
            }
        });
    },

    showTerminateDatePicker() {
        const today = new Date().toISOString().split('T')[0];
        const { tenant } = this.data;

        wx.showModal({
            title: '选择退租日期',
            content: `请输入退租日期（格式：YYYY-MM-DD），范围：${today} 至 ${tenant.endDate}`,
            editable: true,
            placeholderText: today,
            success: (res) => {
                if (res.confirm && res.content) {
                    // 简单验证日期格式
                    if (/^\d{4}-\d{2}-\d{2}$/.test(res.content)) {
                        this.confirmTerminate(res.content);
                    } else {
                        wx.showToast({ title: '日期格式错误', icon: 'none' });
                    }
                }
            }
        });
    },

    confirmTerminate(terminateDate) {
        const { tenant } = this.data;

        wx.showModal({
            title: '确认退租',
            content: `确定要办理 ${tenant.name} 的退租手续吗？\n\n退租日期：${terminateDate}\n押金：¥${tenant.deposit}（需退还）`,
            confirmText: '确认退租',
            confirmColor: '#ef4444',
            success: async (res) => {
                if (res.confirm) {
                    await this.doTerminateContract(terminateDate);
                }
            }
        });
    },

    async doTerminateContract(terminateDate) {
        const { tenantId, tenant } = this.data;

        wx.showLoading({ title: '退租处理中...' });

        try {
            // 更新合同状态为已终止
            const { error } = await supabase
                .from('contracts')
                .update({
                    status: 'terminated',
                    end_date: terminateDate
                })
                .eq('id', tenantId)
                .exec();

            if (error) throw error;

            wx.hideLoading();
            wx.showModal({
                title: '退租成功',
                content: `${tenant.name} 的合同已终止。\n\n请记得：\n1. 办理房屋交接\n2. 退还押金 ¥${tenant.deposit}\n3. 结清水电费`,
                showCancel: false,
                success: () => {
                    // 返回租客列表
                    wx.navigateBack();
                }
            });
        } catch (err) {
            console.error('退租失败', err);
            wx.hideLoading();
            wx.showToast({ title: '退租失败，请重试', icon: 'none' });
        }
    }
});
