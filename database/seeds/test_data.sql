-- =====================================================
-- 智居AI 测试数据种子脚本（全UUID版）
-- 房东手机号: 15840008791
-- =====================================================

-- 定义固定的UUID用于关联
DO $$
DECLARE
    v_landlord_id UUID := '11111111-1111-1111-1111-111111111111';
    v_tenant1_id UUID := '22222222-2222-2222-2222-222222222221';
    v_tenant2_id UUID := '22222222-2222-2222-2222-222222222222';
    v_tenant3_id UUID := '22222222-2222-2222-2222-222222222223';
    v_prop1_id UUID := '33333333-3333-3333-3333-333333333331';
    v_prop2_id UUID := '33333333-3333-3333-3333-333333333332';
    v_prop3_id UUID := '33333333-3333-3333-3333-333333333333';
    v_prop4_id UUID := '33333333-3333-3333-3333-333333333334';
    v_prop5_id UUID := '33333333-3333-3333-3333-333333333335';
    v_contract1_id UUID := '44444444-4444-4444-4444-444444444441';
    v_contract2_id UUID := '44444444-4444-4444-4444-444444444442';
    v_contract3_id UUID := '44444444-4444-4444-4444-444444444443';
    v_member1_id UUID := '55555555-5555-5555-5555-555555555551';
    v_member2_id UUID := '55555555-5555-5555-5555-555555555552';
    v_member3_id UUID := '55555555-5555-5555-5555-555555555553';
BEGIN

-- =====================================================
-- 1. 创建房东/租客/团队成员表（VARCHAR类型ID）
-- =====================================================
CREATE TABLE IF NOT EXISTS landlords (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    status VARCHAR(20) DEFAULT 'active',
    uuid_id UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    status VARCHAR(20) DEFAULT 'active',
    uuid_id UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. 插入房东账号（VARCHAR + UUID对照）
-- =====================================================
INSERT INTO landlords (id, name, phone, status, uuid_id, created_at) VALUES
('landlord-15840008791', '房东用户', '15840008791', 'active', v_landlord_id, NOW())
ON CONFLICT (id) DO UPDATE SET phone = '15840008791', uuid_id = v_landlord_id, updated_at = NOW();

-- =====================================================
-- 3. 插入测试房源
-- =====================================================
INSERT INTO properties (id, landlord_id, title, address, rent_amount, status, property_type, area, description, created_at) VALUES
(v_prop1_id, v_landlord_id, '阳光花园1栋101室', '北京市朝阳区阳光花园小区1栋101室', 3500, 'rented', 'apartment', 45, '精装修一居室', NOW()),
(v_prop2_id, v_landlord_id, '阳光花园1栋102室', '北京市朝阳区阳光花园小区1栋102室', 4200, 'rented', 'apartment', 68, '温馨两居室', NOW()),
(v_prop3_id, v_landlord_id, '阳光花园2栋201室', '北京市朝阳区阳光花园小区2栋201室', 5800, 'available', 'apartment', 95, '宽敞三居室', NOW()),
(v_prop4_id, v_landlord_id, '金辉大厦A座1501', '北京市朝阳区建国路金辉大厦A座1501', 8500, 'rented', 'office', 120, '甲级写字楼', NOW()),
(v_prop5_id, v_landlord_id, '翠景园3号楼302', '北京市海淀区翠景园3号楼302', 6200, 'available', 'apartment', 78, '学区房近地铁', NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. 添加contracts表扩展字段
-- =====================================================
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS tenant_name VARCHAR(100);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS tenant_phone VARCHAR(20);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS tenant_id_number VARCHAR(20);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS property_title VARCHAR(200);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS property_address TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS notes TEXT;

-- =====================================================
-- 5. 插入测试合同
-- =====================================================
INSERT INTO contracts (id, property_id, landlord_id, tenant_id, tenant_name, tenant_phone, tenant_id_number, property_title, property_address, rent_amount, deposit_amount, start_date, end_date, status, created_at) VALUES
(v_contract1_id, v_prop1_id, v_landlord_id, v_tenant1_id, '张小明', '13800138001', '110101199001011234', '阳光花园1栋101室', '北京市朝阳区阳光花园小区1栋101室', 3500, 3500, '2024-01-01', '2025-01-01', 'active', NOW()),
(v_contract2_id, v_prop2_id, v_landlord_id, v_tenant2_id, '李小红', '13900139002', '110101199203052341', '阳光花园1栋102室', '北京市朝阳区阳光花园小区1栋102室', 4200, 4200, '2024-03-01', '2025-03-01', 'active', NOW()),
(v_contract3_id, v_prop4_id, v_landlord_id, v_tenant3_id, '王建国', '13700137003', '110101198506123456', '金辉大厦A座1501', '北京市朝阳区建国路金辉大厦A座1501', 8500, 17000, '2024-06-01', '2025-06-01', 'active', NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. 插入测试缴费记录
-- =====================================================
INSERT INTO payments (contract_id, property_id, tenant_id, landlord_id, amount, payment_type, due_date, paid_date, status, created_at) VALUES
(v_contract1_id, v_prop1_id, v_tenant1_id, v_landlord_id, 3500, 'rent', '2024-11-05', '2024-11-03', 'paid', NOW() - INTERVAL '60 days'),
(v_contract1_id, v_prop1_id, v_tenant1_id, v_landlord_id, 3500, 'rent', '2024-12-05', '2024-12-04', 'paid', NOW() - INTERVAL '30 days'),
(v_contract1_id, v_prop1_id, v_tenant1_id, v_landlord_id, 3500, 'rent', '2025-01-05', NULL, 'pending', NOW()),
(v_contract2_id, v_prop2_id, v_tenant2_id, v_landlord_id, 4200, 'rent', '2024-11-05', '2024-11-05', 'paid', NOW() - INTERVAL '60 days'),
(v_contract2_id, v_prop2_id, v_tenant2_id, v_landlord_id, 4200, 'rent', '2024-12-05', NULL, 'overdue', NOW() - INTERVAL '30 days'),
(v_contract2_id, v_prop2_id, v_tenant2_id, v_landlord_id, 4200, 'rent', '2025-01-05', NULL, 'pending', NOW()),
(v_contract3_id, v_prop4_id, v_tenant3_id, v_landlord_id, 8500, 'rent', '2024-12-05', '2024-12-01', 'paid', NOW() - INTERVAL '30 days'),
(v_contract3_id, v_prop4_id, v_tenant3_id, v_landlord_id, 8500, 'rent', '2025-01-05', NULL, 'pending', NOW());

-- =====================================================
-- 7. 插入预约看房
-- =====================================================
INSERT INTO viewing_appointments (property_id, landlord_id, guest_name, guest_phone, appointment_date, appointment_time, notes, status, created_at) VALUES
(v_prop3_id, v_landlord_id, '赵小刚', '15800158001', CURRENT_DATE + INTERVAL '2 days', '下午', '周末看房', 'pending', NOW()),
(v_prop5_id, v_landlord_id, '钱小丽', '15900159002', CURRENT_DATE + INTERVAL '3 days', '上午', '了解周边', 'pending', NOW()),
(v_prop3_id, v_landlord_id, '孙小明', '13600136001', CURRENT_DATE - INTERVAL '5 days', '上午', NULL, 'completed', NOW() - INTERVAL '7 days'),
(v_prop5_id, v_landlord_id, '周小华', '13500135001', CURRENT_DATE - INTERVAL '3 days', '下午', '已确认', 'confirmed', NOW() - INTERVAL '5 days');

-- =====================================================
-- 8. 插入报修工单
-- =====================================================
INSERT INTO repair_orders (property_id, tenant_id, landlord_id, title, description, category, priority, status, created_at) VALUES
(v_prop1_id, v_tenant1_id, v_landlord_id, '卫生间水龙头漏水', '水龙头关不紧', 'plumbing', 'medium', 'pending', NOW()),
(v_prop2_id, v_tenant2_id, v_landlord_id, '空调不制热', '空调无热风', 'appliance', 'high', 'assigned', NOW() - INTERVAL '1 day'),
(v_prop4_id, v_tenant3_id, v_landlord_id, '门锁更换', '门锁老化', 'structure', 'low', 'completed', NOW() - INTERVAL '10 days');

-- =====================================================
-- 9. 插入团队成员
-- =====================================================
INSERT INTO landlords (id, name, phone, status, uuid_id, created_at) VALUES
('member-001', '张管家', '13811111111', 'active', v_member1_id, NOW()),
('member-002', '李销售', '13822222222', 'active', v_member2_id, NOW()),
('member-003', '王师傅', '13833333333', 'active', v_member3_id, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO team_members (landlord_id, member_id, role, status, invited_at, joined_at) VALUES
(v_landlord_id, v_member1_id, 'manager', 'active', NOW() - INTERVAL '30 days', NOW() - INTERVAL '29 days'),
(v_landlord_id, v_member2_id, 'sales', 'pending', NOW() - INTERVAL '7 days', NULL),
(v_landlord_id, v_member3_id, 'maintenance', 'active', NOW() - INTERVAL '60 days', NOW() - INTERVAL '59 days');

-- =====================================================
-- 10. 插入房东设置
-- =====================================================
INSERT INTO landlord_settings (landlord_id, reminder_days, notify_overdue_days, daily_reminder, created_at) VALUES
(v_landlord_id, '{7,3,1}', 1, true, NOW())
ON CONFLICT (landlord_id) DO UPDATE SET reminder_days = '{7,3,1}', daily_reminder = true;

END $$;

-- =====================================================
-- 完成！
-- 房东VARCHAR ID: landlord-15840008791
-- 房东UUID: 11111111-1111-1111-1111-111111111111
-- =====================================================
