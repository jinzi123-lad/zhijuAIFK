-- =====================================================
-- 智居AI - 统一房东账号同步脚本
-- 用途：创建调试账号，解决小程序和Web端数据不同步问题
-- 执行方式：在 Supabase SQL Editor 中运行
-- =====================================================

-- 配置变量（可根据需要修改）
-- 测试手机号: 15840008791
-- 测试UUID: 11111111-1111-1111-1111-111111111111

-- =====================================================
-- 第1步：创建/更新 landlords 表中的房东账号
-- =====================================================

-- 删除可能存在的旧测试数据（避免冲突）
DELETE FROM landlords WHERE phone = '15840008791';

-- 插入统一的调试房东账号
INSERT INTO landlords (
    id,
    name,
    phone,
    avatar_url,
    uuid_id,
    status,
    membership_type,
    created_at,
    updated_at
) VALUES (
    'landlord-15840008791',                      -- 小程序使用的ID格式
    '调试房东',                                   -- 显示名称
    '15840008791',                               -- 手机号
    '',                                          -- 头像URL
    '11111111-1111-1111-1111-111111111111',     -- 关键：UUID用于关联业务表
    'active',                                    -- 状态
    'paid',                                      -- 会员类型（测试用）
    NOW(),
    NOW()
);

-- =====================================================
-- 第2步：创建房东设置（收款码等）
-- =====================================================

-- 删除旧的设置记录
DELETE FROM landlord_settings WHERE landlord_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM landlord_settings WHERE landlord_id = 'landlord-15840008791';

-- 插入房东设置
INSERT INTO landlord_settings (
    id,
    landlord_id,
    payment_qrcode,
    reminder_days,
    notify_overdue_days,
    daily_reminder,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',    -- 使用UUID格式
    NULL,
    ARRAY[7, 3],
    0,
    TRUE,
    NOW(),
    NOW()
);

-- =====================================================
-- 第3步：创建房东详细资料（如果landlord_profiles表存在）
-- =====================================================

-- 检查并插入landlord_profiles（如果表存在）
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'landlord_profiles') THEN
        DELETE FROM landlord_profiles WHERE landlord_id = '11111111-1111-1111-1111-111111111111';
        DELETE FROM landlord_profiles WHERE phone = '15840008791';
        
        INSERT INTO landlord_profiles (
            id,
            landlord_id,
            name,
            phone,
            created_at
        ) VALUES (
            gen_random_uuid(),
            '11111111-1111-1111-1111-111111111111',
            '调试房东',
            '15840008791',
            NOW()
        );
    END IF;
END $$;

-- =====================================================
-- 第4步：创建测试房产（确保与房东关联正确）
-- =====================================================

-- 删除旧的测试房产
DELETE FROM properties WHERE landlord_id = '11111111-1111-1111-1111-111111111111';

-- 插入测试房产1 - 分散式住宅
INSERT INTO properties (
    id,
    landlord_id,
    title,
    name,
    property_type,
    management_type,
    address,
    city,
    district,
    rent_amount,
    area,
    bedrooms,
    bathrooms,
    status,
    description,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',    -- 使用UUID关联
    '阳光花园 3栋201',
    '阳光花园 3栋201',
    'apartment',
    'scattered',
    '北京市朝阳区阳光路123号',
    '北京',
    '朝阳区',
    4500.00,
    85,
    2,
    1,
    'available',
    '精装修两居室，采光好，交通便利，近地铁口',
    NOW(),
    NOW()
);

-- 插入测试房产2 - 集中式公寓
INSERT INTO properties (
    id,
    landlord_id,
    title,
    name,
    property_type,
    management_type,
    address,
    city,
    district,
    rent_amount,
    area,
    bedrooms,
    bathrooms,
    status,
    description,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    '天悦公寓A座 1601室',
    '天悦公寓A座 1601室',
    'urban_apartment',
    'centralized',
    '北京市海淀区中关村大街88号',
    '北京',
    '海淀区',
    5800.00,
    45,
    1,
    1,
    'rented',
    '精品公寓，拎包入住，配套齐全',
    NOW(),
    NOW()
);

-- 插入测试房产3 - 空置房源
INSERT INTO properties (
    id,
    landlord_id,
    title,
    name,
    property_type,
    management_type,
    address,
    city,
    district,
    rent_amount,
    area,
    bedrooms,
    bathrooms,
    status,
    description,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    '珍珠花园 15B',
    '珍珠花园 15B',
    'apartment',
    'scattered',
    '北京市西城区珍珠路45号',
    '北京',
    '西城区',
    3800.00,
    65,
    1,
    1,
    'available',
    '温馨一居室，适合单身白领',
    NOW(),
    NOW()
);

-- =====================================================
-- 第5步：验证查询
-- =====================================================

-- 验证房东账号
SELECT 
    '房东账号' as 类型,
    id,
    name as 姓名,
    phone as 手机号,
    uuid_id as UUID,
    status as 状态,
    membership_type as 会员类型
FROM landlords 
WHERE phone = '15840008791';

-- 验证房产数据
SELECT 
    '房产' as 类型,
    id,
    title as 标题,
    property_type as 类型,
    status as 状态,
    rent_amount as 租金,
    landlord_id as 房东UUID
FROM properties 
WHERE landlord_id = '11111111-1111-1111-1111-111111111111';

-- 验证房东设置
SELECT 
    '设置' as 类型,
    landlord_id as 房东UUID,
    reminder_days as 提醒天数,
    daily_reminder as 每日提醒
FROM landlord_settings 
WHERE landlord_id = '11111111-1111-1111-1111-111111111111';

-- =====================================================
-- 完成！
-- 
-- 使用方式：
-- 1. 小程序端：使用手机号 15840008791 登录房东端
-- 2. Web端：查看"账号管理" -> "房东账号"
-- 
-- 数据关联说明：
-- - landlords.id = 'landlord-15840008791' (小程序登录ID)
-- - landlords.uuid_id = '11111111-1111-1111-1111-111111111111' (业务表关联用)
-- - properties.landlord_id = '11111111-1111-1111-1111-111111111111'
-- =====================================================
