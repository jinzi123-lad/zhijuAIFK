/**
 * 通知服务 - 创建和发送通知
 */

const { supabase } = require('../utils/supabase')

const NotificationService = {
    /**
     * 创建通知
     * @param {Object} data - 通知数据
     */
    async create(data) {
        const { data: result, error } = await supabase
            .from('notifications')
            .insert([{
                user_id: data.userId,
                user_role: data.userRole,
                type: data.type,
                title: data.title,
                content: data.content,
                related_id: data.relatedId,
                related_type: data.relatedType,
                is_read: false
            }])
            .select()
            .single()

        if (error) throw error
        return result
    },

    /**
     * 获取用户通知列表
     * @param {string} userId 
     */
    async getByUser(userId) {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) throw error
        return data
    },

    /**
     * 获取未读数量
     * @param {string} userId 
     */
    async getUnreadCount(userId) {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false)

        if (error) throw error
        return count
    },

    /**
     * 标记为已读
     * @param {string} id 
     */
    async markAsRead(id) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        if (error) throw error
    },

    /**
     * 标记全部已读
     * @param {string} userId 
     */
    async markAllAsRead(userId) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false)

        if (error) throw error
    },

    // 预定义的通知模板
    templates: {
        // 预约相关
        viewingRequested: (propertyTitle, tenantName) => ({
            title: '收到新的看房预约',
            content: `${tenantName}预约看房《${propertyTitle}》`
        }),
        viewingConfirmed: (propertyTitle, date, time) => ({
            title: '预约已确认',
            content: `房东已确认，${date} ${time}看房《${propertyTitle}》`
        }),
        viewingRescheduled: (propertyTitle, newDate, newTime) => ({
            title: '房东建议改期',
            content: `房东建议将《${propertyTitle}》看房改为${newDate} ${newTime}`
        }),
        viewingCancelled: (propertyTitle, reason) => ({
            title: '预约已取消',
            content: `《${propertyTitle}》的预约已取消，原因：${reason}`
        }),

        // 合同相关
        contractInvited: (propertyTitle, initiatorName) => ({
            title: '收到签约邀请',
            content: `${initiatorName}邀请您签约《${propertyTitle}》`
        }),
        contractSigned: (propertyTitle) => ({
            title: '合同已生效',
            content: `《${propertyTitle}》的租赁合同已正式生效`
        }),

        // 缴费相关
        paymentReminder: (propertyTitle, amount, dueDate) => ({
            title: '房租缴费提醒',
            content: `《${propertyTitle}》房租¥${amount}将于${dueDate}到期`
        }),
        paymentReceived: (tenantName, amount) => ({
            title: '收到租金',
            content: `${tenantName}已缴纳租金¥${amount}，请确认`
        }),

        // 报修相关
        repairRequested: (propertyTitle, tenantName) => ({
            title: '收到报修申请',
            content: `${tenantName}提交了《${propertyTitle}》的报修申请`
        }),
        repairCompleted: (propertyTitle) => ({
            title: '维修已完成',
            content: `《${propertyTitle}》的报修已完成，请确认`
        })
    }
}

module.exports = { NotificationService }
