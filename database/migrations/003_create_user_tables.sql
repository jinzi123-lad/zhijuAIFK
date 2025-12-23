-- 创建房东表（用于存储房东账号信息）
CREATE TABLE IF NOT EXISTS landlords (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    openid VARCHAR(100),
    unionid VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    membership_type VARCHAR(20) DEFAULT 'free',
    membership_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建租客表（用于存储租客账号信息）
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    openid VARCHAR(100),
    unionid VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_landlords_phone ON landlords(phone);
CREATE INDEX IF NOT EXISTS idx_landlords_openid ON landlords(openid);
CREATE INDEX IF NOT EXISTS idx_tenants_phone ON tenants(phone);
CREATE INDEX IF NOT EXISTS idx_tenants_openid ON tenants(openid);
