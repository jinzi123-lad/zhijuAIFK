-- =====================================================
-- 智居AI 数据库表创建脚本
-- 执行方式：在 Supabase SQL Editor 中运行
-- =====================================================

-- 1. 预约看房表
CREATE TABLE IF NOT EXISTS viewing_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL,
    landlord_id UUID NOT NULL,
    tenant_id UUID,
    source VARCHAR(20) DEFAULT 'miniapp', -- miniapp/web
    operator_id UUID, -- 如果是Web端操作，记录操作员
    guest_name VARCHAR(100), -- 如果未登录租客填的姓名
    guest_phone VARCHAR(20), -- 如果未登录租客填的电话
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL, -- 上午/下午/晚上 或具体时间
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending/confirmed/rescheduled/cancelled/completed
    reschedule_date DATE,
    reschedule_time VARCHAR(20),
    reschedule_reason TEXT,
    cancel_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 合同表
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL,
    landlord_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    template_id UUID,
    custom_content JSONB, -- 合同完整内容
    rent_amount DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2),
    payment_day INTEGER DEFAULT 5, -- 每月缴费日
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    landlord_signature TEXT, -- Base64签名图片
    tenant_signature TEXT,
    landlord_signed_at TIMESTAMPTZ,
    tenant_signed_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'draft', -- draft/pending_tenant/pending_landlord/signed/active/expired/terminated
    initiated_by VARCHAR(20), -- landlord/tenant
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 合同模板表
CREATE TABLE IF NOT EXISTS contract_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id UUID, -- NULL表示系统预设
    name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL, -- 模板内容，支持变量如 {{租金}}
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 入住验房表
CREATE TABLE IF NOT EXISTS move_in_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL,
    property_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    landlord_id UUID NOT NULL,
    living_room_images TEXT[], -- 客厅照片
    bedroom_images TEXT[], -- 卧室照片
    bathroom_images TEXT[], -- 卫生间照片
    kitchen_images TEXT[], -- 厨房照片
    other_images TEXT[], -- 其他照片
    tenant_notes TEXT,
    landlord_notes TEXT,
    tenant_submitted_at TIMESTAMPTZ,
    landlord_confirmed_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending', -- pending/submitted/confirmed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 报修工单表
CREATE TABLE IF NOT EXISTS repair_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    landlord_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    images TEXT[],
    category VARCHAR(50), -- plumbing/electrical/appliance/structure/other
    priority VARCHAR(20) DEFAULT 'medium', -- low/medium/high/urgent
    responsibility VARCHAR(20), -- landlord/tenant/shared
    assigned_to UUID, -- 派给谁
    assigned_type VARCHAR(20), -- self/staff/external
    cost DECIMAL(10,2),
    cost_bearer VARCHAR(20), -- landlord/tenant/shared
    status VARCHAR(20) DEFAULT 'pending', -- pending/assigned/in_progress/completed/confirmed
    completion_notes TEXT,
    completion_images TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ
);

-- 6. 缴费记录表
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL,
    property_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    landlord_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(20) DEFAULT 'rent', -- rent/deposit/utility/other
    due_date DATE NOT NULL,
    paid_date DATE,
    payment_method VARCHAR(20), -- online/offline
    proof_url TEXT, -- 凭证图片
    status VARCHAR(20) DEFAULT 'pending', -- pending/paid/confirmed/overdue
    confirmed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 通知表
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_role VARCHAR(20), -- tenant/landlord/staff
    type VARCHAR(50) NOT NULL, -- viewing/contract/payment/repair/system
    title VARCHAR(200) NOT NULL,
    content TEXT,
    related_id UUID, -- 关联的预约/合同/工单ID
    related_type VARCHAR(50), -- viewing/contract/repair/payment
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 用户认证表
CREATE TABLE IF NOT EXISTS user_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    id_card_front TEXT, -- 身份证正面
    id_card_back TEXT, -- 身份证反面
    real_name VARCHAR(50),
    id_number VARCHAR(20),
    face_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pending', -- pending/approved/rejected
    rejected_reason TEXT,
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 房产备案表
CREATE TABLE IF NOT EXISTS property_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL,
    landlord_id UUID NOT NULL,
    property_cert_image TEXT, -- 房产证照片
    owner_with_cert_image TEXT, -- 房东与房产证合照
    authorization_letter TEXT, -- 委托书（如有）
    status VARCHAR(20) DEFAULT 'pending', -- pending/approved/rejected
    rejected_reason TEXT,
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. 团队成员表
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id UUID NOT NULL, -- 房东（老板）
    member_id UUID NOT NULL, -- 成员用户ID
    role VARCHAR(20) NOT NULL, -- manager/sales/finance/maintenance
    property_scope VARCHAR(20) DEFAULT 'all', -- all/selected
    property_ids UUID[], -- 如果scope是selected，具体房源ID
    status VARCHAR(20) DEFAULT 'pending', -- pending/active/removed
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    removed_at TIMESTAMPTZ
);

-- 11. 房东设置表
CREATE TABLE IF NOT EXISTS landlord_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id UUID NOT NULL UNIQUE,
    payment_qrcode TEXT, -- 收款码图片
    reminder_days INTEGER[] DEFAULT '{7,3}', -- 提前几天提醒
    notify_overdue_days INTEGER DEFAULT 0, -- 逾期几天通知房东
    daily_reminder BOOLEAN DEFAULT TRUE, -- 逾期后每日提醒
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. 给users表添加会员字段（如果表已存在）
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_status VARCHAR(20) DEFAULT 'free';
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMPTZ;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_type VARCHAR(20); -- regular/trial/partner

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_viewing_landlord ON viewing_appointments(landlord_id);
CREATE INDEX IF NOT EXISTS idx_viewing_tenant ON viewing_appointments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_viewing_property ON viewing_appointments(property_id);
CREATE INDEX IF NOT EXISTS idx_contracts_landlord ON contracts(landlord_id);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant ON contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_landlord ON repair_orders(landlord_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_tenant ON repair_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_contract ON payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
