-- =====================================================
-- 插入测试房东账号到 landlords 表
-- 在 Supabase SQL Editor 中执行此脚本
-- =====================================================

-- 插入您的测试账号（如果已存在则更新）
INSERT INTO landlords (id, name, phone, status, created_at)
VALUES (
    'landlord-15840008791',           -- 使用您的小程序登录ID
    '测试房东',                         -- 显示名称
    '15840008791',                     -- 手机号
    'active',                          -- 状态
    NOW()                              -- 创建时间
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    status = EXCLUDED.status,
    updated_at = NOW();

-- 同时插入使用UUID格式的记录（兼容不同ID格式）
INSERT INTO landlords (id, name, phone, status, created_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',  -- 测试UUID
    '测试房东',
    '15840008791',
    'active',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    status = EXCLUDED.status,
    updated_at = NOW();

-- 查询验证
SELECT * FROM landlords ORDER BY created_at DESC;
