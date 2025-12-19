import { Property } from "../types";
import { BACKEND_URL } from "./backend";

// Unified Backend Proxy Caller
// This function forwards standard OpenAI-compatible messages to the backend.
const callBackendProxy = async (
    systemInstruction: string,
    userPrompt: string,
    modelName: string = "deepseek-ai/DeepSeek-V3", // Default model, acts as a hint to backend or unused if backend overrides
    jsonMode: boolean = false,
    base64Image?: string
): Promise<string> => {
    try {
        const messages: any[] = [];
        if (systemInstruction) {
            messages.push({ role: "system", content: systemInstruction });
        }

        const userContent: any[] = [];
        userContent.push({ type: "text", text: userPrompt });

        if (base64Image) {
            const imageData = base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`;
            userContent.push({
                type: "image_url",
                image_url: { url: imageData }
            });
        }

        messages.push({ role: "user", content: userContent });

        // Forward to Backend Proxy
        // Note: The backend 'ai/chat' endpoint processes { messages: [...] } body.
        const response = await fetch(`${BACKEND_URL}/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                model: modelName, // Optional, backend might ignore if fixed
                stream: false
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Backend AI Proxy Error:", response.status, errText);
            throw new Error(`AI Service Error: ${response.status}`);
        }

        const data = await response.json();
        // Compatible with standard OpenAI response format
        return data.choices?.[0]?.message?.content || data.response || "AI 无响应";

    } catch (e) {
        console.error("AI Service Call Failed:", e);
        return "智能服务暂时繁忙，请稍后再试。";
    }
};

/**
 * Configure AI - No-op now as configuration is handled in backend.
 * Kept for type compatibility if needed, but logs a warning.
 */
export const configureAI = (apiKey?: string, endpoint?: string, modelName?: string, provider?: any) => {
    console.log("Frontend AI Configuration is deprecated. Please configure environment variables in your Backend (Vercel).");
};

/**
 * Generates a sales pitch for a specific property.
 */
export const generateSalesPitch = async (property: Property): Promise<string> => {
    const prompt = `
      房源信息：
      - 标题: ${property.title}
      - 类型: ${property.type === 'RENT' ? '出租' : '出售'}
      - 价格: ${property.price} ${property.type === 'RENT' ? '元/月' : '元 (总价)'}
      - 面积: ${property.area} 平方米
      - 户型: ${property.layout}
      - 位置: ${property.location} (${property.address})
      - 标签: ${property.tags.join(', ')}
      - 描述: ${property.description}
      - 通勤信息: ${property.commuteInfo || '未知'}
    `;

    const systemPrompt = `
      你是一位资深的房地产金牌销售。请根据用户提供的房源信息，写一段吸引人的销售话术（Pitch）。
      话术要求：
      1. 语气热情、专业、真诚。
      2. 突出房源的亮点（如位置、价格、装修、配套等）。
      3. 针对潜在客户的痛点（如通勤、舒适度、投资价值）进行引导。
      4. 包含一个强有力的结尾，引导客户预约看房。
    `;

    return await callBackendProxy(systemPrompt, prompt);
};

/**
 * Intelligent Property Search/Matching.
 */
export const searchPropertiesWithAI = async (query: string, properties: Property[]): Promise<{ matchedIds: string[], destinationLocation?: { lat: number, lng: number }, reasoning: string, commuteEstimates?: Record<string, string> }> => {
    // [OPTIMIZATION] - drastically reduce payload size for faster AI response
    // Instead of full JSON objects, use a compact pipe-delimited string format
    const simplifiedProperties = properties.map(p =>
        `ID:${p.id}|${p.location}|${p.type === 'RENT' ? p.price + '/月' : p.price + '万'}|${p.layout}|${p.tags.slice(0, 3).join(',')}`
    ).slice(0, 50); // Hard limit to top 50 properties to prevent timeout/token overflow

    const systemPrompt = `你是一个快速房产检索引擎。请从下方列表中筛选出符合用户口语化需求的房源 ID。列表格式为: "ID:xxx|位置|价格|户型|特色"。`;
    const userPrompt = `
        用户需求: "${query}"
        
        房源简表 (Top 50 Candidates):
        ${simplifiedProperties.join('\n')}
        
        任务：
        1. 筛选匹配 ID (matchedIds)。
        2. 识别用户提到的“目的地” (destinationLocation)，如无则留空。
        3. 如果有目的地，估算通勤 (commuteEstimates)。
        4. 简要理由 (reasoning)。
        
        Response JSON:
        {
          "matchedIds": ["id1", "id2"],
          "destinationLocation": { "lat": 39.9, "lng": 116.4 },
          "reasoning": "...",
          "commuteEstimates": [{ "id": "id1", "description": "🚗 5km 15min" }]
        }
    `;

    // Use jsonMode=true for structured output if supported, or rely on prompt instruction
    const responseText = await callBackendProxy(systemPrompt, userPrompt, "deepseek-ai/DeepSeek-V3", true);

    if (responseText && responseText !== "智能服务暂时繁忙，请稍后再试。") {
        try {
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(cleanJson);

            const estimatesMap: Record<string, string> = {};
            if (Array.isArray(result.commuteEstimates)) {
                result.commuteEstimates.forEach((item: any) => {
                    if (item.id && item.description) {
                        estimatesMap[item.id] = item.description;
                    }
                });
            }
            return { ...result, commuteEstimates: estimatesMap };
        } catch (e) {
            console.error("AI Parse Error", e);
        }
    }
    return { matchedIds: [], reasoning: "无法解析 AI 响应。" };
};

/**
 * Autocomplete suggestions.
 */
export const getLocationSuggestions = async (keyword: string): Promise<Array<{ name: string, address: string, lat: number, lng: number }>> => {
    // 1. Hardcoded Mock Data (Fastest)
    const mockData = [
        { name: '国贸', address: '北京市朝阳区建国门外大街', lat: 39.9083, lng: 116.4556 },
        { name: '中关村', address: '北京市海淀区', lat: 39.9806, lng: 116.3069 },
        { name: '望京', address: '北京市朝阳区', lat: 39.9958, lng: 116.4786 },
        { name: '三里屯', address: '北京市朝阳区工体北路', lat: 39.9351, lng: 116.4551 },
        { name: '西二旗', address: '北京市海淀区', lat: 40.0528, lng: 116.3057 },
        { name: '天安门', address: '北京市东城区', lat: 39.9042, lng: 116.4074 },
        { name: '亦庄', address: '北京市大兴区', lat: 39.8000, lng: 116.5000 },
        { name: '通州副中心', address: '北京市通州区', lat: 39.9100, lng: 116.6500 },
        { name: '北京南站', address: '北京市丰台区', lat: 39.8651, lng: 116.3785 },
        { name: '奥林匹克公园', address: '北京市朝阳区', lat: 40.0169, lng: 116.3965 },
    ];
    const filtered = mockData.filter(item => item.name.includes(keyword));
    if (filtered.length > 0) return filtered;

    // 2. Fallback to AI (Backend)
    try {
        const prompt = `请提供 3-5 个与 "${keyword}" 相关的中国具体地点建议。返回 JSON 数组，包含 name, address, lat, lng。`;
        const responseText = await callBackendProxy("Return valid JSON array.", prompt, "deepseek-ai/DeepSeek-V3", true);

        if (responseText && responseText !== "智能服务暂时繁忙，请稍后再试。") {
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            // Try to extract array part if extra text exists
            const arrayMatch = cleanJson.match(/\[.*\]/s);
            if (arrayMatch) {
                return JSON.parse(arrayMatch[0]);
            }
            return JSON.parse(cleanJson);
        }
    } catch (e) {
        console.error("Suggestion Error", e);
    }
    return [];
};

/**
 * Knowledge Base Image Analysis.
 */
export const analyzeImageForKnowledgeBase = async (base64Image: string): Promise<string> => {
    const prompt = "请详细分析这张图片的内容。如果图片包含文字（如政策文档、房产海报、数据图表），请提取所有文字内容。如果图片是房屋照片，请描述其装修风格、家具配置和特色。你的回答将被存入知识库，用于后续回答用户问题。";
    return await callBackendProxy("你是一个图片分析助手。", prompt, "deepseek-ai/DeepSeek-V3", false, base64Image);
};

/**
 * General Chat.
 */
export const getAIChatResponse = async (message: string, knowledgeContext?: string): Promise<string> => {
    const systemInstruction = `
      你是一个专业的房产咨询 AI 助手，名叫“智居小管家”。
      
      【知识库检索规则】
      ${knowledgeContext ? `我为你提供了一些内部知识库的相关内容，请**优先**基于以下内容回答用户的问题：\n\n${knowledgeContext}\n\n如果以上知识库内容与用户问题无关或信息不足，请忽略它，使用你自己的通用知识进行回答。` : '请使用你自己的通用房产知识进行回答。'}
      
      【回答原则】
      1. 必须用中文回答。
      2. 态度亲切、专业。
      3. 如果知识库中包含具体的政策、税率或话术，请准确引用。
    `;

    return await callBackendProxy(systemInstruction, message);
};

/**
 * Smart Fill (Parsing).
 */
export const parsePropertyInfoWithAI = async (text: string, base64Image?: string): Promise<any> => {
    const prompt = `
        你是一个智能房产信息提取助手。请根据提供的文本内容（和图片内容），提取房源的关键信息，并以 JSON 格式返回。
        
        输入文本:
        ${text}
        
        请尽可能提取以下字段。如果信息不存在，请留空或使用默认值。
        
        Schema Definition:
        - title: 简短的房源标题 (string)
        - type: "RENT" (出租) 或 "SALE" (出售)
        - category: "住宅" | "别墅" | "写字楼" | "商铺" | "公寓" (根据描述推断)
        - price: 价格数字 (number)
        - area: 面积数字 (number)
        - layout: 户型，如"2室1厅" (string)
        - province: 省份，如"北京" (string)
        - city: 城市，如"北京" (string)
        - district: 区县，如"朝阳" (string)
        - address: 详细地址 (string)
        - tags: 房源特色标签列表 (array of strings)
        - description: 详细描述 (string)
        - commuteInfo: 交通情况 (string)
        - contacts: 房东联系人列表 [{name, phone}]
        
        注意：价格租房为元/月，售房为元。
        请务必返回纯 JSON。
    `;

    const responseText = await callBackendProxy("Return valid JSON.", prompt, "deepseek-ai/DeepSeek-V3", true, base64Image);

    if (responseText && responseText !== "智能服务暂时繁忙，请稍后再试。") {
        try {
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error("Smart Fill Parse Error", e);
        }
    }
    return null;
};
