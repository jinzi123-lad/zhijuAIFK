// 合同设置页面
const { supabase } = require('../../../../utils/supabase')

Page({
    data: {
        presetTemplates: [
            {
                id: 'preset-1',
                name: '标准住房租赁合同',
                description: '适用于普通住宅租赁'
            },
            {
                id: 'preset-2',
                name: '商业物业租赁合同',
                description: '适用于商铺、写字楼'
            },
            {
                id: 'preset-3',
                name: '短租合同模板',
                description: '适用于3个月以下短租'
            }
        ],
        customTemplates: [],
        allTemplateNames: ['标准住房租赁合同', '商业物业租赁合同', '短租合同模板'],
        defaultTemplateIndex: 0
    },

    onLoad() {
        this.loadCustomTemplates()
    },

    onShow() {
        this.loadCustomTemplates()
    },

    async loadCustomTemplates() {
        const landlordUuid = wx.getStorageSync('landlord_uuid') || '11111111-1111-1111-1111-111111111111'
        console.log('=== 开始加载模板 ===')
        console.log('landlord_uuid:', landlordUuid)

        try {
            // 暂时不过滤landlord_id，查看全部数据
            const { data, error } = await supabase
                .from('contract_templates')
                .select('*')
                .range(0, 99)  // 返回最多100条
                .order('created_at', { ascending: false })
                .exec()

            console.log('查询全部模板, error:', error)
            console.log('查询全部模板, data类型:', typeof data, Array.isArray(data))
            console.log('查询全部模板, data:', JSON.stringify(data))
            console.log('data长度:', data ? data.length : 0)

            if (!data || data.length === 0) {
                console.log('没有查询到数据')
                this.setData({ customTemplates: [] })
                return
            }

            // 直接用查询到的数据，不做任何过滤
            const customTemplates = data.map((t, index) => {
                console.log(`处理第${index + 1}条:`, t.id, t.name)
                return {
                    id: t.id || `temp-${index}-${Date.now()}`,
                    name: t.name || `合同${index + 1}`,
                    uploadDate: t.created_at ? new Date(t.created_at).toLocaleDateString('zh-CN') : '未知'
                }
            })

            console.log('最终customTemplates数组:', customTemplates)
            console.log('数组长度:', customTemplates.length)

            this.setData({ customTemplates })
            console.log('setData完成')
        } catch (err) {
            console.error('加载自定义模板失败', err)
        }
    },

    // 预览模板
    previewTemplate(e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/landlord/settings/contract/preview/index?id=${id}`
        })
    },

    // 使用模板
    useTemplate(e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/landlord/contract/create/index?templateId=${id}`
        })
    },

    // 上传自定义合同（支持多份）
    uploadContract() {
        wx.chooseMessageFile({
            count: 9,
            type: 'file',
            extension: ['pdf', 'doc', 'docx'],
            success: async (res) => {
                const files = res.tempFiles
                console.log('选择的文件:', files.length, files)
                if (files.length === 0) return

                wx.showLoading({ title: '上传中...' })
                const landlordUuid = wx.getStorageSync('landlord_uuid') || '11111111-1111-1111-1111-111111111111'
                console.log('房东UUID:', landlordUuid)

                let successCount = 0
                let errors = []

                for (let i = 0; i < files.length; i++) {
                    const file = files[i]
                    let name = file.name || `自定义合同${i + 1}`
                    name = name.replace(/\.(pdf|doc|docx)$/i, '')

                    console.log(`正在上传第 ${i + 1} 份:`, name)

                    const { data, error } = await supabase
                        .from('contract_templates')
                        .insert([{
                            landlord_id: landlordUuid,
                            name: name,
                            content: file.path || '',
                            is_default: false
                        }])
                        .exec()

                    if (error) {
                        console.error(`第 ${i + 1} 份上传失败:`, error)
                        errors.push(name)
                    } else {
                        console.log(`第 ${i + 1} 份上传成功`)
                        successCount++
                    }
                }

                wx.hideLoading()
                console.log('上传完成, 成功:', successCount, '失败:', errors)

                if (successCount > 0) {
                    wx.showToast({ title: `成功${successCount}份，失败${errors.length}份`, icon: successCount === files.length ? 'success' : 'none' })
                    this.loadCustomTemplates()
                } else {
                    wx.showToast({ title: '全部上传失败', icon: 'none' })
                }
            },
            fail: () => {
                wx.showToast({ title: '请选择合同文件', icon: 'none' })
            }
        })
    },

    // 删除模板
    deleteTemplate(e) {
        const id = e.currentTarget.dataset.id
        wx.showModal({
            title: '确认删除',
            content: '删除后无法恢复，是否继续？',
            success: async (res) => {
                if (res.confirm) {
                    try {
                        await supabase
                            .from('contract_templates')
                            .delete()
                            .eq('id', id)
                            .exec()

                        wx.showToast({ title: '已删除', icon: 'success' })
                        this.loadCustomTemplates()
                    } catch (err) {
                        wx.showToast({ title: '删除失败', icon: 'none' })
                    }
                }
            }
        })
    },

    // 设置默认模板
    setDefaultTemplate(e) {
        const index = e.detail.value
        this.setData({ defaultTemplateIndex: index })
        wx.setStorageSync('defaultContractTemplate', this.data.allTemplateNames[index])
        wx.showToast({ title: '已设置默认模板', icon: 'success' })
    }
})
