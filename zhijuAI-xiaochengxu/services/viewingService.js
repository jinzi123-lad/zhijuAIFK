/**
 * 预约看房服务 - 与Supabase交互
 */

const { supabase } = require('../utils/supabase')

const ViewingService = {
    /**
     * 创建预约
     * @param {Object} data - 预约数据
     */
    async create(data) {
        const { data: result, error } = await supabase
            .from('viewing_appointments')
            .insert([{
                property_id: data.propertyId,
                landlord_id: data.landlordId,
                tenant_id: data.tenantId,
                guest_name: data.guestName,
                guest_phone: data.guestPhone,
                appointment_date: data.date,
                appointment_time: data.time,
                notes: data.notes,
                source: data.source || 'miniapp',
                operator_id: data.operatorId,
                status: 'pending'
            }])
            .select()
            .single()

        if (error) throw error
        return result
    },

    /**
     * 获取房东的预约列表
     * @param {string} landlordId 
     * @param {string} status - 可选状态筛选
     */
    async getByLandlord(landlordId, status) {
        let query = supabase
            .from('viewing_appointments')
            .select(`
        *,
        properties:property_id (title, address, image_url)
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
     * 获取租客的预约列表
     * @param {string} tenantId 
     */
    async getByTenant(tenantId) {
        const { data, error } = await supabase
            .from('viewing_appointments')
            .select(`
        *,
        properties:property_id (title, address, image_url)
      `)
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    /**
     * 获取预约详情
     * @param {string} id 
     */
    async getById(id) {
        const { data, error } = await supabase
            .from('viewing_appointments')
            .select(`
        *,
        properties:property_id (title, address, image_url, landlord_contacts)
      `)
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    /**
     * 确认预约
     * @param {string} id 
     */
    async confirm(id) {
        const { data, error } = await supabase
            .from('viewing_appointments')
            .update({
                status: 'confirmed',
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * 改期
     * @param {string} id 
     * @param {Object} rescheduleData 
     */
    async reschedule(id, rescheduleData) {
        const { data, error } = await supabase
            .from('viewing_appointments')
            .update({
                status: 'rescheduled',
                reschedule_date: rescheduleData.date,
                reschedule_time: rescheduleData.time,
                reschedule_reason: rescheduleData.reason,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * 同意改期
     * @param {string} id 
     */
    async agreeReschedule(id) {
        // 先获取改期信息
        const appointment = await this.getById(id)

        const { data, error } = await supabase
            .from('viewing_appointments')
            .update({
                status: 'confirmed',
                appointment_date: appointment.reschedule_date,
                appointment_time: appointment.reschedule_time,
                reschedule_date: null,
                reschedule_time: null,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * 取消预约
     * @param {string} id 
     * @param {string} reason 
     */
    async cancel(id, reason) {
        const { data, error } = await supabase
            .from('viewing_appointments')
            .update({
                status: 'cancelled',
                cancel_reason: reason,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * 标记为已完成
     * @param {string} id 
     */
    async complete(id) {
        const { data, error } = await supabase
            .from('viewing_appointments')
            .update({
                status: 'completed',
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }
}

module.exports = { ViewingService }
