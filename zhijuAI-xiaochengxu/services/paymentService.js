/**
 * 缴费服务 - 与Supabase交互
 */

const { supabase } = require('../utils/supabase')

const PaymentService = {
    /**
     * 获取租客账单列表
     */
    async getByTenant(tenantId, status) {
        let query = supabase
            .from('payments')
            .select(`
        *,
        properties:property_id (title)
      `)
            .eq('tenant_id', tenantId)
            .order('due_date', { ascending: false })

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query
        if (error) throw error
        return data
    },

    /**
     * 获取房东收款记录
     */
    async getByLandlord(landlordId, status) {
        let query = supabase
            .from('payments')
            .select(`
        *,
        properties:property_id (title)
      `)
            .eq('landlord_id', landlordId)
            .order('due_date', { ascending: false })

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query
        if (error) throw error
        return data
    },

    /**
     * 租客提交缴费凭证
     */
    async submitProof(id, proofUrl) {
        const { data, error } = await supabase
            .from('payments')
            .update({
                status: 'paid',
                proof_url: proofUrl,
                paid_date: new Date().toISOString().split('T')[0]
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * 房东确认收款
     */
    async confirm(id) {
        const { data, error } = await supabase
            .from('payments')
            .update({
                status: 'confirmed',
                confirmed_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * 生成账单（合同激活后调用）
     */
    async generateBills(contract) {
        const bills = []
        const startDate = new Date(contract.start_date)
        const endDate = new Date(contract.end_date)
        const paymentDay = contract.payment_day || 5

        let currentDate = new Date(startDate)
        while (currentDate <= endDate) {
            const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), paymentDay)

            bills.push({
                contract_id: contract.id,
                property_id: contract.property_id,
                tenant_id: contract.tenant_id,
                landlord_id: contract.landlord_id,
                amount: contract.rent_amount,
                payment_type: 'rent',
                due_date: dueDate.toISOString().split('T')[0],
                status: 'pending'
            })

            currentDate.setMonth(currentDate.getMonth() + 1)
        }

        const { data, error } = await supabase
            .from('payments')
            .insert(bills)
            .select()

        if (error) throw error
        return data
    }
}

module.exports = { PaymentService }
