-- 修复合同模板表的RLS策略
-- 在Supabase SQL Editor中运行此脚本

-- 1. 禁用RLS（如果不需要行级安全）
ALTER TABLE contract_templates DISABLE ROW LEVEL SECURITY;

-- 或者如果你想保留RLS，删除可能存在的限制策略：

-- 2. 删除所有现有的RLS策略
DROP POLICY IF EXISTS "landlord_templates_select" ON contract_templates;
DROP POLICY IF EXISTS "landlord_templates_insert" ON contract_templates;
DROP POLICY IF EXISTS "landlord_templates_update" ON contract_templates;
DROP POLICY IF EXISTS "landlord_templates_delete" ON contract_templates;
DROP POLICY IF EXISTS "enable_all_for_authenticated" ON contract_templates;
DROP POLICY IF EXISTS "allow_all" ON contract_templates;

-- 3. 如果需要RLS，创建开放的策略
-- ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "allow_all" ON contract_templates FOR ALL USING (true) WITH CHECK (true);

-- 4. 检查表中当前有多少条记录
SELECT COUNT(*) as total_count, landlord_id 
FROM contract_templates 
GROUP BY landlord_id;

-- 5. 查看所有模板
SELECT id, name, landlord_id, is_default, created_at 
FROM contract_templates 
ORDER BY created_at DESC;
