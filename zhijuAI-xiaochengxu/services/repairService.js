/**
 * 报修工单服务 - 与Supabase交互
 */

const { supabase } = require('../utils/supabase')

const RepairService = {
    /**
     * 创建报修工单
     */
    async create(data) {
        const { data: result, error } = await supabase
            .from('repair_orders')
            .insert([{
                property_id: data.propertyId,
                tenant_id: data.tenantId,
                landlord_id: data.landlordId,
                title: data.title,
                description: data.description,
                images: data.images,
                category: data.category,
                priority: data.priority || 'medium',
                status: 'pending'
            }])
            .select()
            .single()

        if (error) throw error
        return result
    },

    /**
     * 获取租客工单列表
     */
    async getByTenant(tenantId) {
        const { data, error } = await supabase
            .from('repair_orders')
            .select(`
        *,
        properties:property_id (title)
      `)
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    /**
     * 获取房东工单列表
     */
    async getByLandlord(landlordId, status) {
        let query = supabase
            .from('repair_orders')
            .select(`
        *,
        properties:property_id (title)
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
     * 派单
     */
    async assign(id, assignData) {
        const { data, error } = await supabase
            .from('repair_orders')
            .update({
                assigned_to: assignData.assignedTo,
                assigned_type: assignData.assignedType,
                responsibility: assignData.responsibility,
                status: 'assigned'
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * 更新进度
     */
    async updateStatus(id, status) {
        const { data, error } = await supabase
            .from('repair_orders')
            .update({ status })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * 完成维修
     */
    async complete(id, completionData) {
        const { data, error } = await supabase
            .from('repair_orders')
            .update({
                status: 'completed',
                completion_notes: completionData.notes,
                completion_images: completionData.images,
                cost: completionData.cost,
                cost_bearer: completionData.costBearer,
                completed_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * 租客确认
     */
    async confirm(id) {
        const { data, error } = await supabase
            .from('repair_orders')
            .update({
                status: 'confirmed',
                confirmed_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }
}

module.exports = { RepairService }
