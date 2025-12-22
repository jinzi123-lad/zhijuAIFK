/**
 * 合同服务 - 与Supabase交互
 */

const { supabase } = require('../utils/supabase')

const ContractService = {
    /**
     * 创建合同（房东发起）
     */
    async create(data) {
        const { data: result, error } = await supabase
            .from('contracts')
            .insert([{
                property_id: data.propertyId,
                landlord_id: data.landlordId,
                tenant_id: data.tenantId,
                template_id: data.templateId,
                rent_amount: data.rentAmount,
                deposit_amount: data.depositAmount,
                payment_day: data.paymentDay,
                start_date: data.startDate,
                end_date: data.endDate,
                custom_content: data.customContent,
                initiated_by: 'landlord',
                status: 'pending_tenant'
            }])
            .select()
            .single()

        if (error) throw error
        return result
    },

    /**
     * 获取房东的合同列表
     */
    async getByLandlord(landlordId, status) {
        let query = supabase
            .from('contracts')
            .select(`
        *,
        properties:property_id (title, address)
      `)
            .eq('landlord_id', landlordId)
            .order('created_at', { ascending: false })

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query
        if (error) throw error
        return data
    },

    /**
     * 获取租客的合同列表
     */
    async getByTenant(tenantId) {
        const { data, error } = await supabase
            .from('contracts')
            .select(`
        *,
        properties:property_id (title, address)
      `)
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    /**
     * 获取合同详情
     */
    async getById(id) {
        const { data, error } = await supabase
            .from('contracts')
            .select(`
        *,
        properties:property_id (title, address, image_url)
      `)
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    /**
     * 租客签名
     */
    async tenantSign(id, signatureData) {
        const { data, error } = await supabase
            .from('contracts')
            .update({
                tenant_signature: signatureData,
                tenant_signed_at: new Date().toISOString(),
                status: 'signed', // 如果房东也签了，可能需要变成active
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * 房东签名
     */
    async landlordSign(id, signatureData) {
        const { data, error } = await supabase
            .from('contracts')
            .update({
                landlord_signature: signatureData,
                landlord_signed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * 激活合同（验房后）
     */
    async activate(id) {
        const { data, error } = await supabase
            .from('contracts')
            .update({
                status: 'active',
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * 终止合同
     */
    async terminate(id, reason) {
        const { data, error } = await supabase
            .from('contracts')
            .update({
                status: 'terminated',
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }
}

module.exports = { ContractService }
