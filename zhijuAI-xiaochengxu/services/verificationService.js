/**
 * 认证服务 - 与Supabase交互
 */

const { supabase } = require('../utils/supabase')

const VerificationService = {
    /**
     * 获取用户认证状态
     */
    async getByUser(userId) {
        const { data, error } = await supabase
            .from('user_verifications')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error && error.code !== 'PGRST116') throw error
        return data
    },

    /**
     * 提交实名认证
     */
    async submit(data) {
        const { data: result, error } = await supabase
            .from('user_verifications')
            .upsert([{
                user_id: data.userId,
                id_card_front: data.idCardFront,
                id_card_back: data.idCardBack,
                real_name: data.realName,
                id_number: data.idNumber,
                status: 'pending',
                submitted_at: new Date().toISOString()
            }])
            .select()
            .single()

        if (error) throw error
        return result
    },

    /**
     * 审核通过（Web端使用）
     */
    async approve(id, reviewerId) {
        const { data, error } = await supabase
            .from('user_verifications')
            .update({
                status: 'approved',
                reviewed_at: new Date().toISOString(),
                reviewed_by: reviewerId
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * 审核驳回（Web端使用）
     */
    async reject(id, reason, reviewerId) {
        const { data, error } = await supabase
            .from('user_verifications')
            .update({
                status: 'rejected',
                rejected_reason: reason,
                reviewed_at: new Date().toISOString(),
                reviewed_by: reviewerId
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }
}

/**
 * 团队管理服务
 */
const TeamService = {
    /**
     * 获取房东的团队成员
     */
    async getByLandlord(landlordId) {
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .eq('landlord_id', landlordId)
            .neq('status', 'removed')
            .order('invited_at', { ascending: false })

        if (error) throw error
        return data
    },

    /**
     * 邀请成员
     */
    async invite(data) {
        const { data: result, error } = await supabase
            .from('team_members')
            .insert([{
                landlord_id: data.landlordId,
                member_id: data.memberId,
                role: data.role,
                property_scope: data.propertyScope || 'all',
                property_ids: data.propertyIds,
                status: 'pending'
            }])
            .select()
            .single()

        if (error) throw error
        return result
    },

    /**
     * 接受邀请
     */
    async acceptInvite(id) {
        const { data, error } = await supabase
            .from('team_members')
            .update({
                status: 'active',
                joined_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * 更新角色
     */
    async updateRole(id, role, propertyScope, propertyIds) {
        const { data, error } = await supabase
            .from('team_members')
            .update({
                role,
                property_scope: propertyScope,
                property_ids: propertyIds
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * 移除成员
     */
    async remove(id) {
        const { data, error } = await supabase
            .from('team_members')
            .update({
                status: 'removed',
                removed_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }
}

module.exports = { VerificationService, TeamService }
