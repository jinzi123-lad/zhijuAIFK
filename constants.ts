





import { Property, PropertyType, User, UserRole, LandlordType, KnowledgeItem, PropertyStatus, Order, OrderStatus, SystemLog, Client, ClientStatus, Permission, ViewingAgent } from './types';

export const PERMISSION_LABELS: Record<Permission, string> = {
  'PROPERTY_CREATE': '发布房源',
  'PROPERTY_EDIT': '编辑房源',
  'PROPERTY_DELETE': '删除房源',
  'PROPERTY_VIEW_ALL': '查看全部房源 (不限归属)',
  'PROPERTY_MANAGE_OWN': '仅管理自有房源',
  'CLIENT_CREATE': '录入客源',
  'CLIENT_EDIT': '编辑客户',
  'CLIENT_VIEW_ALL': '查看客源公海/全部客户',
  'CLIENT_ASSIGN': '分配/转移客户',
  'ORDER_MANAGE': '订单/合同管理',
  'DATA_EXPORT': '导出业务数据 (Excel)',
  'VIEW_DASHBOARD': '查看经营数据大屏',
  'USER_MANAGE': '管理下属/账号',
  'SYSTEM_SETTINGS': '系统设置管理'
};

export const PERMISSION_GROUPS = [
  { name: '房源中心', perms: ['PROPERTY_CREATE', 'PROPERTY_EDIT', 'PROPERTY_DELETE', 'PROPERTY_VIEW_ALL', 'PROPERTY_MANAGE_OWN'] as Permission[] },
  { name: '客源 CRM', perms: ['CLIENT_CREATE', 'CLIENT_EDIT', 'CLIENT_VIEW_ALL', 'CLIENT_ASSIGN'] as Permission[] },
  { name: '交易与数据', perms: ['ORDER_MANAGE', 'DATA_EXPORT', 'VIEW_DASHBOARD'] as Permission[] },
  { name: '系统安全', perms: ['USER_MANAGE', 'SYSTEM_SETTINGS'] as Permission[] }
];

export const ALL_PERMISSIONS = Object.entries(PERMISSION_LABELS).map(([value, label]) => ({
  value: value as Permission,
  label
}));

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    'PROPERTY_CREATE', 'PROPERTY_EDIT', 'PROPERTY_DELETE', 'PROPERTY_VIEW_ALL',
    'CLIENT_CREATE', 'CLIENT_EDIT', 'CLIENT_VIEW_ALL', 'CLIENT_ASSIGN',
    'ORDER_MANAGE', 'DATA_EXPORT', 'VIEW_DASHBOARD',
    'USER_MANAGE', 'SYSTEM_SETTINGS'
  ],
  [UserRole.ADMIN]: [
    'PROPERTY_CREATE', 'PROPERTY_EDIT', 'PROPERTY_DELETE', 'PROPERTY_VIEW_ALL',
    'CLIENT_CREATE', 'CLIENT_EDIT', 'CLIENT_VIEW_ALL', 'CLIENT_ASSIGN',
    'ORDER_MANAGE', 'DATA_EXPORT', 'VIEW_DASHBOARD',
    'USER_MANAGE'
  ],
  [UserRole.MANAGER]: [
    'PROPERTY_CREATE', 'PROPERTY_EDIT', 'PROPERTY_VIEW_ALL',
    'CLIENT_CREATE', 'CLIENT_EDIT', 'CLIENT_VIEW_ALL', 'CLIENT_ASSIGN',
    'ORDER_MANAGE', 'VIEW_DASHBOARD',
    'USER_MANAGE'
  ],
  [UserRole.SALES]: [
    'PROPERTY_CREATE', 'PROPERTY_EDIT',
    'CLIENT_CREATE', 'CLIENT_EDIT',
    'ORDER_MANAGE', 'VIEW_DASHBOARD'
  ],
  [UserRole.LANDLORD]: [
    'PROPERTY_MANAGE_OWN'
  ],
  [UserRole.USER]: [],
  [UserRole.FINANCE]: ['DATA_EXPORT', 'VIEW_DASHBOARD'],
  [UserRole.ADMIN_STAFF]: ['USER_MANAGE', 'CLIENT_ASSIGN', 'PROPERTY_VIEW_ALL', 'CLIENT_VIEW_ALL']
};

// Initial Mock Users
export const INITIAL_USERS: User[] = [
  {
    id: '1',
    username: '123',
    password: '123',
    role: UserRole.SUPER_ADMIN,
    name: '系统超级管理员',
    group: '总经办',
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.SUPER_ADMIN],
    favorites: []
  },
  {
    id: '2',
    username: 'admin',
    password: 'password',
    role: UserRole.ADMIN,
    name: '北京区域经理',
    group: '北京分公司',
    managerId: '1',
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.ADMIN],
    favorites: []
  },
  {
    id: '3',
    username: 'sales',
    password: 'password',
    role: UserRole.SALES,
    name: '金牌房产顾问',
    group: '朝阳销售一组',
    managerId: '2',
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.SALES],
    favorites: []
  },
  {
    id: 'finance_01',
    username: 'finance',
    password: '123',
    role: UserRole.FINANCE,
    name: '财务专员-李姐',
    group: '财务部',
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.FINANCE],
    favorites: []
  },
  {
    id: 'admin_01',
    username: 'admin_staff',
    password: '123',
    role: UserRole.ADMIN_STAFF,
    name: '行政-小王',
    group: '行政部',
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.ADMIN_STAFF],
    favorites: []
  },
  {
    id: 'l_01',
    username: 'landlord_wang',
    password: 'password',
    role: UserRole.LANDLORD,
    name: '王房东',
    group: '个人业主',
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.LANDLORD],
    favorites: []
  },
  {
    id: 'u_01',
    username: 'user_li',
    password: 'password',
    role: UserRole.USER,
    name: '李租客',
    group: '注册会员',
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.USER],
    favorites: []
  }
];

// Mock Viewing Agents
export const MOCK_VIEWING_AGENTS: ViewingAgent[] = [
  { id: 'va_01', name: '张带看', phone: '13800138001', region: '朝阳区', defaultFee: 50, status: 'ACTIVE' },
  { id: 'va_02', name: '李跑腿', phone: '13900139002', region: '海淀区', defaultFee: 60, status: 'ACTIVE' },
  { id: 'va_03', name: '王钥匙', phone: '13700137003', region: '丰台区', defaultFee: 40, status: 'INACTIVE' }
];

// Mock Clients (CRM)
export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c_01',
    name: '张伟先生',
    phone: '13812345678',
    requirements: '朝阳区两居室，近地铁，预算8000左右',
    budget: '8000元/月',
    status: ClientStatus.FOLLOWING,
    source: '网络端口',
    agentId: '3',
    lastContactDate: '2023-10-26',
    notes: '客户比较挑剔，注重隔音'
  },
  {
    id: 'c_04',
    name: '赵小妹',
    phone: '15011112222',
    requirements: '合租单间，亦庄附近',
    budget: '3000元/月',
    status: ClientStatus.NEW,
    source: '上门客',
    agentId: '3',
    lastContactDate: '2023-10-29'
  },
  // Historical
  {
    id: 'c_05',
    name: '陈先生 (已签)',
    phone: '13600136000',
    requirements: '两居室',
    budget: '8000',
    status: ClientStatus.SIGNED,
    source: '网络',
    agentId: '3',
    lastContactDate: '2023-09-01',
    leaseStartDate: '2023-09-05',
    leaseEndDate: '2024-09-05'
  },
  {
    id: 'c_06',
    name: '赵女士 (已归档)',
    phone: '13500135000',
    requirements: '一居室',
    budget: '5000',
    status: ClientStatus.ARCHIVED,
    source: '网络',
    agentId: '3',
    lastContactDate: '2023-08-01',
    archiveReason: '已在别处租房'
  }
];

// Region Data Hierarchy for Dropdowns
export const CASCADING_REGIONS: Record<string, Record<string, string[]>> = {
  '北京': {
    '北京': ['朝阳', '海淀', '东城', '西城', '丰台', '石景山', '通州', '昌平', '大兴', '顺义', '房山', '门头沟', '怀柔', '平谷', '密云', '延庆', '亦庄']
  },
  '上海': {
    '上海': ['浦东', '静安', '徐汇', '杨浦', '松江', '闵行', '黄浦', '长宁', '普陀']
  },
  '广东': {
    '广州': ['天河', '越秀', '海珠'],
    '深圳': ['南山', '福田', '罗湖']
  }
};

export const LEASE_TERM_OPTIONS = ['日租', '周租', '月租', '季租', '半年租', '年租'];

// Detailed Inspection Options
export const DETAILED_OPTIONS = {
  utilities: ['水电燃气家电全正常', '部分家电需维修', '线路老化需注意', '燃气需开通'],
  wallCondition: ['墙面完好无瑕疵', '轻微使用痕迹', '局部有水印/渗漏', '墙皮有开裂/脱落', '窗边密封条老化'],
  soundproofing: ['双层真空玻璃(优)', '普通玻璃(良)', '临街噪音大(差)', '隔音效果一般'],
  fireSafety: ['消防设施齐全有效', '配备灭火器', '无烟雾报警器', '消防设施缺失'],
  doorLock: ['智能指纹/密码锁', 'C级防盗锁芯', '普通机械锁', '锁具老旧需更换'],
  paymentMethod: ['押一付一', '押二付一', '押一付二', '押一付三', '其他押金方式', '免押金'],
  breachTerms: ['标准违约责任', '严格违约赔偿', '协商解决', '未明确'],
  securityLevel: ['24h保安巡逻', '门禁严密', '普通小区管理', '开放式小区'],
  propertyMgmt: ['品牌物业(万科/绿城等)', '普通物业', '街道办/自管', '无物业'],
  moveInDate: ['随时入住', '1周内', '2周内', '1个月后', '具体协商'],
  nearbyFacilities: ['大型超市', '三甲医院', '地铁枢纽', '幼儿园/小学', '菜市场', '健身房'],
  surroundings: ['安静宜居', '临街热闹', '绿化率高', '正在施工(有噪音)']
};

// Preset Tags Library
export const PRESET_TAGS = {
  '特色': ['近地铁', '随时看房', '拎包入住', '独门独院', '公园房', '地铁房', '学区房', '落地窗', '复式', 'Loft', '四合院'],
  '配置': ['精装修', '豪华装修', '全明户型', '南北通透', '带地暖', '中央空调', '新风系统', '智能家居', '独立卫浴', '开放式厨房'],
  '设施': ['有电梯', '带车位', '健身房', '游泳池', '会所', '24h安保', '人车分流', '免费停车', '充电桩'],
  '租赁': ['押一付一', '免中介费', '短租可谈', '包含物业费', '民用水电', '可养宠物', '可注册'],
  '周边': ['商圈中心', '近医院', '近学校', '近市场', '交通便利', '环境安静', '使馆区']
};

// Knowledge Base Categories
export const KNOWLEDGE_CATEGORIES = [
  '政策法规',
  '销售话术',
  '业务流程',
  '培训资料',
  '纠纷案例'
];

// Mock Knowledge Base Data
export const INITIAL_KNOWLEDGE_BASE: KnowledgeItem[] = [
  // --- 政策法规 ---
  {
    id: 'kb_policy_01',
    title: '北京住房租赁条例核心解读 (2025版)',
    category: '政策法规',
    type: 'TEXT',
    content: '1. 禁止群租：明确规定出租住房应当以原设计的房间为最小出租单位，人均使用面积不得低于5平方米。2. 租金调控：住房租金显著上涨或者有可能显著上涨时，市政府可以采取涨幅限制等干预措施。3. 押金监管：住房租赁企业向承租人收取的押金不得超过一个月租金，并须通过第三方专用账户监管。4. 备案要求：租赁合同签订后3日内，出租人需办理租赁登记备案。',
    createdAt: '2024-01-15'
  },
  {
    id: 'kb_policy_02',
    title: '个人所得税住房租金专项附加扣除指南',
    category: '政策法规',
    type: 'TEXT',
    content: '适用条件：纳税人在主要工作城市没有自有住房而发生的住房租金支出。扣除标准：直辖市、省会城市、计划单列市及国务院确定的其他城市，扣除标准为每月1500元（2024新规调整前标准，具体依当年税务总局公告为准）；市辖区户籍人口超过100万的城市，每月1100元；其他城市每月800元。所需材料：租赁合同编号、房东姓名及身份证号。注意：夫妻双方主要工作城市相同的，只能由一方扣除。',
    createdAt: '2023-12-10'
  },
  {
    id: 'kb_policy_03',
    title: '公积金提取支付房租最新操作流程',
    category: '政策法规',
    type: 'TEXT',
    content: '1. 提取条件：职工及配偶在工作地所在行政区域内无自有住房且租房居住。2. 提取额度：每人每月提取额度上限为2000元（具体视各城市公积金中心规定）。3. 办理渠道：推荐使用“公积金”官方APP或支付宝/微信城市服务进行线上办理，无需提交纸质合同，系统自动联网核查。4. 到账时间：一般申请通过后T+1工作日内到账。',
    createdAt: '2024-03-20'
  },
  {
    id: 'kb_policy_04',
    title: '居住证办理与租赁备案全攻略',
    category: '政策法规',
    type: 'TEXT',
    content: '办理居住证前需先完成租赁合同备案。步骤：1. 房东配合，携带房产证、身份证复印件到属地街道办事处或派出所办理《房屋租赁登记备案证明》。2. 租客携带备案证明、身份证、劳动合同（或社保缴纳记录）到派出所申请居住证（或办理居住登记卡）。注意：部分城市支持“通办”，即线上上传材料申请。',
    createdAt: '2023-11-05'
  },

  // --- 业务流程 ---
  {
    id: 'kb_process_01',
    title: '标准带看服务流程 SOP',
    category: '业务流程',
    type: 'TEXT',
    content: '1. 预约确认：提前2小时与业主和客户再次确认时间地点。2. 提前踩点：经纪人提前15分钟到达小区，检查门禁、电梯及房屋状态（开窗通风、简单整理）。3. 陪同看房：进门递鞋套，先介绍周边配套，再介绍户型结构。看房过程中“多听少说”，观察客户表情。4. 离房检查：确保护照、水电门窗已关闭，垃圾带走。5. 结束反馈：送客户离开后，30分钟内发送看房总结及同类房源推荐。',
    createdAt: '2023-09-01'
  },
  {
    id: 'kb_process_02',
    title: '房屋交割标准清单 (入住/退租)',
    category: '业务流程',
    type: 'TEXT',
    content: '交割必查项目：1. 抄表底数：水表、电表（峰谷）、燃气表读数，并拍照留存。2. 费用结清：查验物业费、供暖费、网费是否结清。3. 设施清点：依据《房屋附属设施清单》逐一核对家电家具品牌、数量及完好程度。4. 钥匙门卡：清点门钥匙、信箱钥匙、单元门禁卡、电卡、气卡数量。5. 签署交割单：双方签字确认，对于有瑕疵的部位拍照并在备注栏注明，避免后期纠纷。',
    createdAt: '2023-08-15'
  },
  {
    id: 'kb_process_03',
    title: '签约前产权核验操作指引',
    category: '业务流程',
    type: 'TEXT',
    content: '目的：防止假房东、一房多租。操作步骤：1. 要求出示房产证原件和业主身份证原件。2. 若为代理人签约，必须出示业主手写/公证的《授权委托书》及代理人身份证。3. 登录当地住建委/不动产登记中心官网，输入产权证号进行“房源核验”，确认房屋无查封、无抵押（或抵押不影响租赁）。4. 确认房屋无共有人异议，若有共有人，需共有人同意外租。',
    createdAt: '2023-10-20'
  },

  // --- 销售话术 ---
  {
    id: 'kb_sales_01',
    title: '应对客户嫌“房租贵”的五步法',
    category: '销售话术',
    type: 'TEXT',
    content: '1. 认同感受：“李先生，我完全理解，现在赚钱都不容易，预算确实要卡紧一点。” 2. 聚焦价值：“不过刚才您也看了，这套房子离您公司步行只要10分钟，虽然贵了300块，但您每天能多睡一小时，这对于工作状态的价值可是远超300块的。” 3. 拆分成本：“其实300块分摊到每一天也就是10块钱，一杯奶茶钱都不到，换来的是每天的高品质生活。” 4. 对比竞品：“同小区那个便宜500的，是朝北的，冬天太冷，这套朝南全天有光。” 5. 逼单：“而且房东这两天就要出国，诚心租，如果您今天能定，我帮您去申请免一周免租期，算下来也省了不少。”',
    createdAt: '2023-12-01'
  },
  {
    id: 'kb_sales_02',
    title: '电话回访破冰与二次邀约',
    category: '销售话术',
    type: 'TEXT',
    content: '破冰：“王小姐您好，我是链家的小张。昨天带您看的那个两居室，您回去和家人商量得怎么样了？” (停顿，听客户反馈) \n应对“再看看”：“没关系，租房是大事。我今天刚出了一套性价比特别高的，就在昨天那个小区隔壁，精装修首次出租，价格还便宜200。这套房子特别抢手，我特意第一个通知您，您今晚下班顺路来看一眼？只要15分钟，不耽误您太多时间。”',
    createdAt: '2024-01-05'
  },
  {
    id: 'kb_sales_03',
    title: '高端客户维护与邀约技巧',
    category: '销售话术',
    type: 'TEXT',
    content: '原则：专业度第一，不仅是中介，更是置业顾问。1. 数据说话：“张总，这是为您整理的该片区近半年豪宅租赁成交数据表，这套房子的单价处于低估区。” 2. 尊重隐私：“我都安排好了，房东那边我也沟通了，看房时会清场，只有我们在，保证私密性。” 3. 稀缺性营销：“这种顶层复式带露台的户型，咱们片区一年也就出这一套，上一个租客是某上市高管，风水特别好。”',
    createdAt: '2023-11-20'
  },

  // --- 纠纷案例 ---
  {
    id: 'kb_case_01',
    title: '租客提前退租违约金纠纷',
    category: '纠纷案例',
    type: 'TEXT',
    content: '案例：租客签了一年合同，住了3个月因工作调动要退租，房东坚持不退押金并要求赔偿。 \n解决方案：1. 依据合同：查看“违约责任”条款，通常约定提前退租需支付1-2个月租金作为违约金。2. 协商减损：建议租客配合转租，若能快速找到新租客，可与房东协商减少违约金扣除额度。3. 法理依据：《民法典》规定，违约金过高（超过实际损失30%）可请求法院予以适当减少。在此类调解中，作为中介应站在中立角度，帮房东算账（空置期损失）和帮租客止损。',
    createdAt: '2023-10-10'
  },
  {
    id: 'kb_case_02',
    title: '家电自然损坏谁来修？权责界定',
    category: '纠纷案例',
    type: 'TEXT',
    content: '案例：入住两个月，洗衣机正常使用下电机烧坏，房东认为是租客弄坏的，租客认为是老化。 \n判责标准：1. 依据《民法典》710条，承租人按照约定方法使用租赁物，致使租赁物受到损耗的，不承担赔偿责任。2. 若是老旧电器（使用年限较长），推定为自然老化，维修义务在房东。3. 若是租客操作不当（如鞋子进洗衣机），则租客赔偿。 \n处理：查验家电生产日期或上次维修记录。建议房东更换，提升房屋竞争力。',
    createdAt: '2023-09-25'
  },
  {
    id: 'kb_case_03',
    title: '二房东跑路，租客如何维权？',
    category: '纠纷案例',
    type: 'TEXT',
    content: '案例：租客将租金交给二房东，二房东未给大房东并失联，大房东上门驱赶租客。 \n风险提示：1. 签约前必须确认二房东是否有“转租权”（大房东书面同意书）。2. 若二房东无权转租，该转租合同对大房东无效，大房东有权收房。3. 租客损失只能向二房东追偿（报警诈骗或民事诉讼）。作为中介，严禁代理无授权的二房东房源。',
    createdAt: '2024-02-14'
  },

  // --- 培训资料 ---
  {
    id: 'kb_train_01',
    title: '房产中介职业道德规范十条',
    category: '培训资料',
    type: 'TEXT',
    content: '1. 诚实守信，不吃差价。2. 如实告知房屋瑕疵，不隐瞒凶宅、查封信息。3. 严守客户隐私，不泄露电话号码。4. 公平竞争，不诋毁同行。5. 着装规范，佩戴工牌。6. 严禁私下收黑钱、好处费。7. 协助客户规避风险，不诱导违规操作。8. 遵守交通规则，带看安全第一。9. 终身学习，精通业务。10. 客户至上，服务为本。',
    createdAt: '2023-01-01'
  },
  {
    id: 'kb_train_02',
    title: '高效摄影技巧：如何拍出吸引人的房源图',
    category: '培训资料',
    type: 'TEXT',
    content: '1. 广角拍摄：使用手机广角模式，站在墙角拍摄，能显得房间更大。2. 水平垂直：保持参考线横平竖直，不要歪斜。3. 光线充足：打开所有灯光，拉开窗帘，尽量白天拍摄。4. 整理收纳：拍摄前把杂物（垃圾桶、拖鞋、脏衣物）移出镜头。5. 重点突出：拍摄亮点（如落地窗、智能马桶、品牌家电）特写。6. 封面图：选一张最漂亮、最亮堂的客厅或卧室图做封面。',
    createdAt: '2023-07-20'
  },
  {
    id: 'kb_train_03',
    title: '房地产基础知识 - 建筑面积与套内面积',
    category: '培训资料',
    type: 'TEXT',
    content: '1. 建筑面积 = 套内建筑面积 + 公摊面积。房产证上写的是建筑面积。2. 套内建筑面积 = 套内使用面积 + 墙体面积 + 阳台面积。3. 得房率 = 套内建筑面积 / 建筑面积。一般高层得房率在70%-78%，多层（洋房）在80%-85%，别墅可达95%以上。租房时客户更关心实际使用面积（地毯面积）。',
    createdAt: '2023-06-15'
  }
];

// Mock System Logs
export const INITIAL_SYSTEM_LOGS: SystemLog[] = [
  { id: 1, action: '登录系统', user: 'admin', ip: '192.168.1.10', time: '2023-10-27 10:23:45', status: '成功' },
  { id: 2, action: '修改房源 [bj01]', user: 'sales', ip: '192.168.1.15', time: '2023-10-27 09:15:22', status: '成功' },
  { id: 3, action: '删除用户 [u_05]', user: '123 (超级管理员)', ip: '192.168.1.2', time: '2023-10-26 16:40:11', status: '成功' },
  { id: 4, action: '导出报表', user: 'admin', ip: '192.168.1.10', time: '2023-10-26 14:20:00', status: '成功' },
  { id: 5, action: '尝试登录', user: 'unknown', ip: '202.106.0.1', time: '2023-10-26 03:11:05', status: '失败' },
  { id: 6, action: '修改系统设置', user: '123 (超级管理员)', ip: '192.168.1.2', time: '2023-10-25 11:22:33', status: '成功' },
  { id: 7, action: '查看房源详情 [bj04]', user: 'sales', ip: '192.168.1.15', time: '2023-10-25 10:05:01', status: '成功' },
];

// --- 1. Manual Properties (Rent Only) ---
const MANUAL_PROPERTIES: Property[] = [
  // 1. Chaoyang - Luxury Rent
  {
    id: 'bj01',
    title: '国贸CBD全景落地窗豪宅',
    type: PropertyType.RENT,
    category: '住宅',
    status: PropertyStatus.AVAILABLE,
    price: 35000,
    area: 180,
    layout: '3室2厅2卫',
    location: '北京朝阳',
    address: '建国门外大街1号',
    tags: ['地标建筑', '豪华装修', '商圈中心', '俯瞰央视'],
    imageUrl: 'https://picsum.photos/400/300?random=101',
    description: '位于北京CBD核心区，紧邻国贸三期，超大落地窗俯瞰长安街繁华夜景。五星级物业服务，专属电梯入户。',
    commuteInfo: '距离国贸地铁站 200米',
    coordinates: { lat: 39.908, lng: 116.455 },
    leaseTerms: ['年租'],
    leaseCommissions: { '年租': '1个月租金' },
    landlordType: LandlordType.INDIVIDUAL,
    landlordContacts: [{ name: '王先生', phone: '13800138000', wechat: 'wang_cbd', note: '房东在国外，联系请提前预约' }],
    details: {
      utilitiesStatus: '水电燃气家电全正常',
      wallCondition: '墙面完好无瑕疵',
      paymentMethod: '付一押一',
      moveInDate: '随时入住'
    }
  },
  // 3. Tongzhou - Loft Rent
  {
    id: 'bj03',
    title: '通州运河核心区 精装Loft',
    type: PropertyType.RENT,
    category: '城市公寓',
    status: PropertyStatus.AVAILABLE,
    price: 5500,
    area: 55,
    layout: '2室1厅',
    location: '北京通州',
    address: '新华北路',
    tags: ['Loft', '精装修', '近地铁', '年轻人社区'],
    imageUrl: 'https://picsum.photos/400/300?random=103',
    description: '双层Loft设计，空间利用率高，适合年轻情侣或单身白领。紧邻运河商务区，生活便利。',
    commuteInfo: '距离通州北关地铁站 300米',
    coordinates: { lat: 39.915, lng: 116.655 },
    leaseTerms: ['季租', '半年租', '年租'],
    landlordType: LandlordType.INDIVIDUAL,
    landlordContacts: [{ name: '张经理', phone: '13666666666', wechat: 'agent_zhang' }]
  },
  // 5. Xicheng - Hutong Courtyard
  {
    id: 'bj05',
    title: '什刹海畔 传统二进四合院',
    type: PropertyType.RENT,
    category: '其他',
    status: PropertyStatus.AVAILABLE,
    price: 80000,
    area: 300,
    layout: '8室3厅',
    location: '北京西城',
    address: '后海北沿',
    tags: ['四合院', '历史风貌', '文化底蕴', '稀缺资源'],
    imageUrl: 'https://picsum.photos/400/300?random=105',
    description: '紧邻后海，保留完整的老北京建筑风貌，内部现代化装修，地暖空调齐全。适合做私人会所或文化工作室。',
    commuteInfo: '距离什刹海地铁站 600米',
    coordinates: { lat: 39.940, lng: 116.385 },
    leaseTerms: ['年租'],
    landlordType: LandlordType.INDIVIDUAL
  },
  // 6. Wangjing - Office Rent
  {
    id: 'bj06',
    title: '望京SOHO 高层景观办公室',
    type: PropertyType.RENT,
    category: '写字楼',
    status: PropertyStatus.AVAILABLE,
    price: 45000, // Monthly
    area: 220,
    layout: '开放式办公区',
    location: '北京朝阳',
    address: '望京街10号',
    tags: ['地标建筑', '互联网聚集', '甲级写字楼', '交通便利'],
    imageUrl: 'https://picsum.photos/400/300?random=106',
    description: '扎哈·哈迪德设计地标建筑，互联网氛围浓厚。高层视野开阔，精装修交付，带3个隔断间。',
    commuteInfo: '距离望京地铁站 400米',
    coordinates: { lat: 39.995, lng: 116.480 },
    leaseTerms: ['年租', '半年租'],
    landlordType: LandlordType.INDIVIDUAL
  },
  // 8. Tiantongyuan - Shared Apt
  {
    id: 'bj08',
    title: '天通苑 阳光主卧带阳台',
    type: PropertyType.RENT,
    category: '住宅',
    status: PropertyStatus.AVAILABLE,
    price: 2800,
    area: 25,
    layout: '合租主卧',
    location: '北京昌平',
    address: '立汤路',
    tags: ['押一付一', '近地铁', '性价比', '带阳台'],
    imageUrl: 'https://picsum.photos/400/300?random=108',
    description: '超大主卧独卫带阳台，采光好。室友作息规律，无不良嗜好。小区门口就是地铁站，生活成本低。',
    commuteInfo: '距离天通苑南地铁站 200米',
    coordinates: { lat: 40.065, lng: 116.415 },
    leaseTerms: ['月租', '季租'],
    landlordType: LandlordType.INDIVIDUAL
  },
  // 10. Daxing - Airport Apt Rent
  {
    id: 'bj10',
    title: '大兴机场配套 新房首租',
    type: PropertyType.RENT,
    category: '住宅',
    status: PropertyStatus.AVAILABLE,
    price: 3500,
    area: 89,
    layout: '2室1厅',
    location: '北京大兴',
    address: '礼贤镇',
    tags: ['新房', '首次出租', '环境安静', '有车位'],
    imageUrl: 'https://picsum.photos/400/300?random=110',
    description: '全新装修，家电家具全配。适合在机场工作的人员，驾车至机场仅需15分钟。',
    commuteInfo: '距离大兴机场线大兴新城站 3公里',
    coordinates: { lat: 39.600, lng: 116.400 },
    leaseTerms: ['年租'],
    landlordType: LandlordType.INDIVIDUAL
  },
  // 12. Sanlitun - Studio Rent
  {
    id: 'bj12',
    title: '三里屯SOHO 时尚开间',
    type: PropertyType.RENT,
    category: '城市公寓',
    status: PropertyStatus.AVAILABLE,
    price: 9000,
    area: 50,
    layout: '1室0厅',
    location: '北京朝阳',
    address: '工体北路',
    tags: ['潮流地标', '夜生活', '精装修', '落地窗'],
    imageUrl: 'https://picsum.photos/400/300?random=112',
    description: '楼下就是三里屯太古里，潮流聚集地。高层视野好，精装全配，适合时尚人士。',
    commuteInfo: '距离团结湖地铁站 500米',
    coordinates: { lat: 39.935, lng: 116.455 },
    leaseTerms: ['月租', '季租', '年租'],
    landlordType: LandlordType.INDIVIDUAL
  },
  // 14. Yizhuang - Factory Rent
  {
    id: 'bj14',
    title: '亦庄经济开发区 独栋厂房',
    type: PropertyType.RENT,
    category: '工厂',
    status: PropertyStatus.AVAILABLE,
    price: 150000, // Monthly
    area: 3000,
    layout: '独栋三层',
    location: '北京亦庄',
    address: '经海路',
    tags: ['生物医药', '高新认证', '排污许可', '大车进出'],
    imageUrl: 'https://picsum.photos/400/300?random=114',
    description: '标准工业厂房，层高6米。配套设施完善，适合生物医药、高端制造等企业入驻。',
    commuteInfo: '距离经海路地铁站 1.5公里',
    coordinates: { lat: 39.800, lng: 116.550 },
    leaseTerms: ['年租', '3年起租'],
    landlordType: LandlordType.INDIVIDUAL
  },
  // 16. Haidian - University Dorm Rent
  {
    id: 'bj16',
    title: '五道口 华清嘉园学生公寓',
    type: PropertyType.RENT,
    category: '住宅',
    status: PropertyStatus.AVAILABLE,
    price: 4000,
    area: 18,
    layout: '合租次卧',
    location: '北京海淀',
    address: '成府路',
    tags: ['宇宙中心', '近高校', '学习氛围', '生活便利'],
    imageUrl: 'https://picsum.photos/400/300?random=116',
    description: '紧邻清华北大，学习氛围浓厚。楼下美食众多，生活极其便利。房间干净整洁，限学生。',
    commuteInfo: '距离五道口地铁站 100米',
    coordinates: { lat: 39.992, lng: 116.338 },
    leaseTerms: ['半年租', '年租'],
    landlordType: LandlordType.INDIVIDUAL
  },
  // 18. Guomao - Serviced Apt Rent (Converted to Corporate Multi-Unit)
  {
    id: 'bj18',
    title: '国贸世纪公寓 酒店式服务',
    type: PropertyType.RENT,
    category: '城市公寓',
    status: PropertyStatus.AVAILABLE,
    price: 18000, // Starting price
    area: 65, // Starting area
    layout: '多户型',
    location: '北京朝阳',
    address: '光华路',
    tags: ['酒店服务', '含早餐', '每日保洁', '拎包入住'],
    imageUrl: 'https://picsum.photos/400/300?random=118',
    description: '提供五星级酒店式服务，包含每日保洁、早餐、健身房使用权。适合外籍高管或商务人士。拥有多种房型可供选择。',
    commuteInfo: '距离金台夕照地铁站 400米',
    coordinates: { lat: 39.915, lng: 116.460 },
    leaseTerms: ['月租', '季租', '年租'],
    landlordType: LandlordType.CORPORATE,
    landlordContacts: [{ name: '前台预定部', phone: '010-88888888' }, { name: '销售总监', phone: '13900000000', wechat: 'guomao_vip' }],
    units: [
      {
        id: 'u1',
        name: '标准开间',
        price: 18000,
        area: 65,
        layout: '1室0厅',
        description: '精致装修，视野开阔，适合单身商务人士。',
        imageUrl: 'https://picsum.photos/400/300?random=201'
      },
      {
        id: 'u2',
        name: '行政一居室',
        price: 25000,
        area: 95,
        layout: '1室1厅',
        description: '带独立客厅和开放式厨房，空间宽敞。',
        imageUrl: 'https://picsum.photos/400/300?random=202'
      },
      {
        id: 'u3',
        name: '豪华两居室',
        price: 38000,
        area: 135,
        layout: '2室2厅',
        description: '双卧双卫设计，适合家庭居住，全景落地窗。',
        imageUrl: 'https://picsum.photos/400/300?random=203'
      }
    ]
  },
  // 20. 798 Art District - Loft Rent
  {
    id: 'bj20',
    title: '798艺术区 创意工作室/Loft',
    type: PropertyType.RENT,
    category: '写字楼',
    status: PropertyStatus.AVAILABLE,
    price: 20000, // Monthly
    area: 150,
    layout: 'Loft开敞式',
    location: '北京朝阳',
    address: '酒仙桥路',
    tags: ['艺术氛围', '工业风', '层高5米', '可注册'],
    imageUrl: 'https://picsum.photos/400/300?random=120',
    description: '位于798艺术区内，老厂房改造，工业风装修，层高5米。适合设计、摄影、广告等创意团队。',
    commuteInfo: '距离望京南地铁站 1公里',
    coordinates: { lat: 39.985, lng: 116.495 },
    leaseTerms: ['年租'],
    landlordType: LandlordType.INDIVIDUAL
  },
  // 21. Urban Village Apt (New Manual Entry)
  {
    id: 'bj21',
    title: '沙河高教园 城中村公寓整租',
    type: PropertyType.RENT,
    category: '城中村公寓',
    status: PropertyStatus.AVAILABLE,
    price: 1500,
    area: 25,
    layout: '1室1卫',
    location: '北京昌平',
    address: '沙河镇某村',
    tags: ['押一付一', '独卫', '近大学', '便宜'],
    imageUrl: 'https://picsum.photos/400/300?random=121',
    description: '位于沙河高教园附近，周边大学生多，生活氛围好。房间带独立卫生间，空调热水器齐全，适合学生或刚工作的年轻人。',
    commuteInfo: '距离沙河地铁站 1.2公里',
    coordinates: { lat: 40.150, lng: 116.280 },
    leaseTerms: ['月租', '季租'],
    landlordType: LandlordType.INDIVIDUAL
  }
];

// --- 2. Helper to Generate 150 more Mock Rental Properties ---
const generateMoreProperties = (): Property[] => {
  const properties: Property[] = [];
  const districts = ['朝阳', '海淀', '东城', '西城', '丰台', '通州', '昌平', '大兴', '顺义', '房山'];
  const bizCircles: Record<string, string[]> = {
    '朝阳': ['国贸', '三里屯', '望京', '朝阳公园', '大望路', '双井', '劲松', '奥体'],
    '海淀': ['中关村', '五道口', '万柳', '清河', '上地', '公主坟', '知春路'],
    '东城': ['东直门', '王府井', '崇文门', '安定门', '东四', '和平里'],
    '西城': ['金融街', '西单', '阜成门', '月坛', '德胜门'],
    '丰台': ['科技园', '六里桥', '方庄', '大红门', '丽泽'],
    '通州': ['运河核心区', '梨园', '马驹桥', '宋庄'],
    '昌平': ['回龙观', '天通苑', '沙河', '南口'],
    '大兴': ['亦庄', '黄村', '西红门', '旧宫'],
    '顺义': ['后沙峪', '首都机场', '顺义城', '马坡'],
    '房山': ['长阳', '良乡', '窦店']
  };

  // Config templates for different property types
  const rentTypes = [
    { cat: '住宅', layouts: ['1室1厅', '2室1厅', '3室1厅', '2室2厅', '3室2厅'], tags: ['精装修', '近地铁', '采光好', '随时入住', '民用水电', '带暖气', '南北通透'] },
    { cat: '城市公寓', layouts: ['1室0厅', '1室1厅', 'Loft'], tags: ['拎包入住', '酒店式管理', '落地窗', '可月付', '独立卫浴', '开放式厨房'] },
    { cat: '城中村公寓', layouts: ['单间', '一房一厅', '复式阁楼'], tags: ['押一付一', '独卫', '近地铁', '便宜', '光线好', '拎包入住'] },
    { cat: '别墅', layouts: ['4室2厅', '5室3厅', '独栋', '联排'], tags: ['带花园', '私密性好', '带车库', '豪华装修', '低密度', '天然氧吧'] },
    { cat: '写字楼', layouts: ['100平米', '200平米', '整层', '联合办公'], tags: ['甲级写字楼', '可注册', '交通便利', '含物业费', '高层视野', '新风系统'] },
    { cat: '商铺', layouts: ['临街', '底商', '内铺', '档口'], tags: ['人流量大', '可餐饮', '门头宽', '成熟社区', '转角铺', '展示面好'] }
  ];

  for (let i = 1; i <= 150; i++) {
    const district = districts[Math.floor(Math.random() * districts.length)];
    const circles = bizCircles[district] || [district];
    const location = circles[Math.floor(Math.random() * circles.length)];

    // Random Type & Layout
    const typeConfig = rentTypes[Math.floor(Math.random() * rentTypes.length)];
    const layout = typeConfig.layouts[Math.floor(Math.random() * typeConfig.layouts.length)];

    // Price logic
    let price = 0;
    let area = 0;
    if (typeConfig.cat === '别墅') { price = 25000 + Math.random() * 50000; area = 200 + Math.random() * 300; }
    else if (typeConfig.cat === '写字楼') { price = 10000 + Math.random() * 100000; area = 100 + Math.random() * 500; }
    else if (typeConfig.cat === '商铺') { price = 8000 + Math.random() * 30000; area = 50 + Math.random() * 200; }
    else if (typeConfig.cat === '城中村公寓') { price = 800 + Math.random() * 2000; area = 15 + Math.random() * 30; }
    else { price = 3000 + Math.random() * 15000; area = 40 + Math.random() * 100; }

    price = Math.floor(price / 100) * 100;
    area = Math.floor(area);

    const latBase = 39.9;
    const lngBase = 116.4;
    const lat = latBase + (Math.random() - 0.5) * 0.2;
    const lng = lngBase + (Math.random() - 0.5) * 0.2;

    properties.push({
      id: `gen_${i}`,
      title: `北京${district}${location} ${layout} ${typeConfig.cat}整租`,
      type: PropertyType.RENT,
      category: typeConfig.cat as any,
      status: PropertyStatus.AVAILABLE,
      price: price,
      area: area,
      layout: layout,
      location: `北京${district}`,
      address: `${location}某小区`,
      tags: typeConfig.tags.sort(() => 0.5 - Math.random()).slice(0, 3),
      imageUrl: `https://picsum.photos/400/300?random=${1000 + i}`,
      description: '自动生成的模拟房源数据，仅供展示使用。房屋状态良好，随时可看。',
      coordinates: { lat, lng },
      leaseTerms: ['年租'],
      landlordType: LandlordType.INDIVIDUAL
    });
  }
  return properties;
};

// Combine Manual + Generated
export const MOCK_PROPERTIES: Property[] = [...MANUAL_PROPERTIES, ...generateMoreProperties()];

// --- 3. Mock Orders ---
export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord_01',
    propertyId: 'bj01',
    propertyTitle: '国贸CBD全景落地窗豪宅',
    propertyImage: 'https://picsum.photos/400/300?random=101',
    clientId: 'c_01',
    clientName: '张伟先生',
    clientPhone: '13812345678',
    agentId: '3',
    agentName: '金牌房产顾问',
    type: PropertyType.RENT,
    price: 35000,
    status: OrderStatus.VIEWING,
    viewingDate: '2023-10-28 14:00',
    createdAt: '2023-10-26'
  },
  {
    id: 'ord_02',
    propertyId: 'bj03',
    propertyTitle: '通州运河核心区 精装Loft',
    propertyImage: 'https://picsum.photos/400/300?random=103',
    clientId: 'c_04',
    clientName: '赵小妹',
    clientPhone: '15011112222',
    agentId: '3',
    agentName: '金牌房产顾问',
    type: PropertyType.RENT,
    price: 5500,
    status: OrderStatus.PENDING,
    contractDate: '2023-10-29',
    createdAt: '2023-10-27'
  }
];

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: '超级管理员',
  [UserRole.ADMIN]: '区域经理',
  [UserRole.MANAGER]: '业务主管',
  [UserRole.SALES]: '房产顾问',
  [UserRole.LANDLORD]: '房东业主',
  [UserRole.USER]: '注册用户',
  [UserRole.FINANCE]: '财务专员',
  [UserRole.ADMIN_STAFF]: '行政专员'
};

export const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'bg-slate-800 text-white',
  [UserRole.ADMIN]: 'bg-purple-100 text-purple-700',
  [UserRole.MANAGER]: 'bg-indigo-100 text-indigo-700',
  [UserRole.SALES]: 'bg-blue-100 text-blue-700',
  [UserRole.LANDLORD]: 'bg-orange-100 text-orange-700',
  [UserRole.USER]: 'bg-green-100 text-green-700',
  [UserRole.FINANCE]: 'bg-yellow-100 text-yellow-700',
  [UserRole.ADMIN_STAFF]: 'bg-pink-100 text-pink-700'
};
