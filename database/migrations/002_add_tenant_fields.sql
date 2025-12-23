-- 为contracts表添加租客信息字段（简化方案，无需关联users表）
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS tenant_name VARCHAR(100);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS tenant_phone VARCHAR(20);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS tenant_id_number VARCHAR(20);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS property_title VARCHAR(200);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS property_address TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS notes TEXT;
