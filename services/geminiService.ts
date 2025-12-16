
import { GoogleGenAI, Type } from "@google/genai";
import { Property } from "../types";

// Dynamic AI Client Management
let aiInstance: GoogleGenAI | null = null;

// Helper to safely access env vars in both Vite (import.meta.env) and standard Node environments
const getEnv = (key: string) => {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        return import.meta.env[`VITE_${key}`] || import.meta.env[key];
    }
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
        // @ts-ignore
        return process.env[key];
    }
    return '';
};

let currentConfig = {
    apiKey: getEnv('API_KEY') || '',
    provider: (getEnv('AI_PROVIDER') as 'GEMINI' | 'OPENAI_COMPATIBLE') || (getEnv('AI_ENDPOINT') ? 'OPENAI_COMPATIBLE' : 'GEMINI'),
    endpoint: getEnv('AI_ENDPOINT') || '', 
    modelName: getEnv('AI_MODEL') || "gemini-2.5-flash"
};

// Helper to get or initialize the Gemini client (only used if provider is GEMINI)
const getGeminiClient = () => {
    if (!aiInstance) {
        aiInstance = new GoogleGenAI({ apiKey: currentConfig.apiKey });
    }
    return aiInstance;
};

// Exported function to re-configure AI at runtime
export const configureAI = (apiKey?: string, endpoint?: string, modelName?: string, provider: 'GEMINI' | 'OPENAI_COMPATIBLE' = 'GEMINI') => {
    currentConfig.apiKey = apiKey || getEnv('API_KEY') || '';
    currentConfig.endpoint = endpoint || '';
    currentConfig.modelName = modelName || "gemini-2.5-flash";
    currentConfig.provider = provider;

    if (provider === 'GEMINI') {
        // Reset Gemini instance
        aiInstance = new GoogleGenAI({ apiKey: currentConfig.apiKey });
    } else {
        // For generic provider, we rely on fetch, so no persistent client needed really, 
        // just clearing Gemini instance to avoid confusion
        aiInstance = null;
    }
    
    console.log(`AI Service Configured: Provider=${provider}, Model=${currentConfig.modelName}, Endpoint=${currentConfig.endpoint || 'Default'}`);
};

// --- Generic OpenAI-Compatible API Caller ---
const callOpenAICompatible = async (
    systemInstruction: string, 
    userPrompt: string, 
    jsonMode: boolean = false,
    base64Image?: string
): Promise<string> => {
    try {
        const baseUrl = currentConfig.endpoint.replace(/\/$/, ''); // Remove trailing slash
        const url = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
        
        const messages: any[] = [];
        if (systemInstruction) {
            messages.push({ role: "system", content: systemInstruction });
        }

        const userContent: any[] = [];
        // Text Content
        userContent.push({ type: "text", text: userPrompt });
        // Image Content (if any)
        if (base64Image) {
            const imageData = base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`;
            userContent.push({
                type: "image_url",
                image_url: { url: imageData }
            });
        }

        messages.push({ role: "user", content: userContent });

        const body: any = {
            model: currentConfig.modelName,
            messages: messages,
            temperature: 0.7,
            stream: false
        };

        // Note: We removed the explicit `response_format: { type: "json_object" }` here.
        // Reason: Not all Open-Source models (like older DeepSeek or Qwen hosted on SiliconFlow) 
        // support this parameter strictly, and might throw 400 Bad Request.
        // We rely on the system prompt instruction "Return JSON" and the cleaner function below.

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentConfig.apiKey}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("AI API Error:", response.status, errText);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
    } catch (e) {
        console.error("Call OpenAI Compatible Failed:", e);
        throw e;
    }
};

/**
 * Generates a sales pitch for a specific property.
 */
export const generateSalesPitch = async (property: Property): Promise<string> => {
  try {
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

    if (currentConfig.provider === 'GEMINI') {
        const response = await getGeminiClient().models.generateContent({
          model: currentConfig.modelName,
          contents: prompt,
          config: { systemInstruction: systemPrompt, temperature: 0.7 }
        });
        return response.text || "无法生成话术，请稍后再试。";
    } else {
        return await callOpenAICompatible(systemPrompt, prompt);
    }
  } catch (error) {
    console.error("Error generating sales pitch:", error);
    return "AI 服务暂时不可用，请检查网络连接或 API 配置。";
  }
};

/**
 * Intelligent Property Search/Matching.
 */
export const searchPropertiesWithAI = async (query: string, properties: Property[]): Promise<{ matchedIds: string[], destinationLocation?: { lat: number, lng: number }, reasoning: string, commuteEstimates?: Record<string, string> }> => {
  try {
    const simplifiedProperties = properties.map(p => ({
      id: p.id,
      info: `${p.title}, ${p.type}, ${p.price}, ${p.location}, ${p.address}, ${p.tags.join(' ')}`
    }));

    const systemPrompt = `作为智能房产顾问，请根据用户的需求，从下面的房源列表中筛选出最匹配的房源。`;
    const userPrompt = `
        用户需求: "${query}"
        
        房源列表:
        ${JSON.stringify(simplifiedProperties)}
        
        任务：
        1. 筛选匹配 ID。
        2. 如果用户提到了“目的地”：
           - **如果用户提供了具体的经纬度坐标，请直接使用该坐标作为目的地 (destinationLocation)。**
           - 如果没有坐标但有地名（如“国贸”、“中关村”），请根据你的地理知识估算该地点的经纬度坐标 (lat, lng)。
           - 如果没有提到目的地，此字段留空。
        3. 【重要】如果识别到了目的地，请利用你的地理知识，估算每个匹配房源到目的地的**实际路程距离**（非直线）和**驾车/公交耗时**。格式如："🚗 5.2公里 约18分钟" 或 "🚇 3站地铁 25分钟"。
           请生成一个 List，每项包含 id (房源ID) 和 description (路程描述)。
        4. 给出推荐理由。
        
        请务必返回纯 JSON 格式结果 (不要包含 Markdown 代码块标记)。
        
        Response Schema (JSON):
        {
          "matchedIds": ["id1", "id2"],
          "destinationLocation": { "lat": 39.90, "lng": 116.40 }, // Optional
          "reasoning": "简短的中文解释",
          "commuteEstimates": [
             { "id": "id1", "description": "🚗 5.2公里 15分钟" }
          ]
        }
    `;

    let responseText = "";

    if (currentConfig.provider === 'GEMINI') {
        const response = await getGeminiClient().models.generateContent({
          model: currentConfig.modelName,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                matchedIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                destinationLocation: {
                    type: Type.OBJECT,
                    properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } },
                    nullable: true
                },
                reasoning: { type: Type.STRING },
                commuteEstimates: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { id: { type: Type.STRING }, description: { type: Type.STRING } }
                    },
                    nullable: true
                }
              },
              required: ["matchedIds", "reasoning"]
            }
          }
        });
        responseText = response.text || "";
    } else {
        responseText = await callOpenAICompatible(systemPrompt, userPrompt, true);
    }

    if (responseText) {
        // Clean markdown blocks if generic provider returns them despite instructions
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
    }
    return { matchedIds: [], reasoning: "无法解析 AI 响应。" };

  } catch (error) {
    console.error("AI Search Error:", error);
    return { matchedIds: [], reasoning: "AI 搜索服务出现错误。" };
  }
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
    ];
    const filtered = mockData.filter(item => item.name.includes(keyword));
    if (filtered.length > 0) return filtered;

    // 2. Fallback to AI
    try {
        const prompt = `请提供 3-5 个与 "${keyword}" 相关的中国具体地点建议。返回 JSON 数组，包含 name, address, lat, lng。`;
        let responseText = "";

        if (currentConfig.provider === 'GEMINI') {
            const response = await getGeminiClient().models.generateContent({
                model: currentConfig.modelName,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                address: { type: Type.STRING },
                                lat: { type: Type.NUMBER },
                                lng: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            });
            responseText = response.text || "";
        } else {
            responseText = await callOpenAICompatible("Return valid JSON array.", prompt, true);
        }
        
        if (responseText) {
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        }
        return [];
    } catch (e) {
        console.error("Suggestion Error", e);
        return [];
    }
};

/**
 * Knowledge Base Image Analysis.
 */
export const analyzeImageForKnowledgeBase = async (base64Image: string): Promise<string> => {
    try {
        const base64Data = base64Image.split(',')[1] || base64Image;
        const prompt = "请详细分析这张图片的内容。如果图片包含文字（如政策文档、房产海报、数据图表），请提取所有文字内容。如果图片是房屋照片，请描述其装修风格、家具配置和特色。你的回答将被存入知识库，用于后续回答用户问题。";

        if (currentConfig.provider === 'GEMINI') {
            const response = await getGeminiClient().models.generateContent({
                model: currentConfig.modelName,
                contents: {
                    parts: [
                        { inlineData: { mimeType: "image/jpeg", data: base64Data } },
                        { text: prompt }
                    ]
                }
            });
            return response.text || "AI 无法识别图片内容。";
        } else {
            try {
                return await callOpenAICompatible("你是一个图片分析助手。", prompt, false, base64Image);
            } catch (e) {
                return "该 AI 模型不支持图片识别或配置错误。";
            }
        }
    } catch (error) {
        console.error("Image Analysis Error:", error);
        return "图片解析服务暂时不可用。";
    }
};

/**
 * General Chat.
 */
export const getAIChatResponse = async (message: string, knowledgeContext?: string): Promise<string> => {
  try {
    const systemInstruction = `
      你是一个专业的房产咨询 AI 助手，名叫“智居小管家”。
      
      【知识库检索规则】
      ${knowledgeContext ? `我为你提供了一些内部知识库的相关内容，请**优先**基于以下内容回答用户的问题：\n\n${knowledgeContext}\n\n如果以上知识库内容与用户问题无关或信息不足，请忽略它，使用你自己的通用知识进行回答。` : '请使用你自己的通用房产知识进行回答。'}
      
      【回答原则】
      1. 必须用中文回答。
      2. 态度亲切、专业。
      3. 如果知识库中包含具体的政策、税率或话术，请准确引用。
    `;

    if (currentConfig.provider === 'GEMINI') {
        const response = await getGeminiClient().models.generateContent({
          model: currentConfig.modelName,
          contents: message,
          config: {
            systemInstruction: systemInstruction,
            // Only Google Models support 'tools: googleSearch' natively in this SDK
            tools: [{googleSearch: {}}], 
          }
        });
        
        // Grounding handling
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        let finalText = response.text || "我暂时无法回答这个问题。";
        if (groundingChunks && groundingChunks.length > 0) {
            const sources = groundingChunks
                .map((chunk: any) => chunk.web?.uri ? `[${chunk.web.title}](${chunk.web.uri})` : null)
                .filter(Boolean)
                .join('\n');
            if (sources) finalText += `\n\n参考来源:\n${sources}`;
        }
        return finalText;
    } else {
        // Generic Provider
        return await callOpenAICompatible(systemInstruction, message);
    }
  } catch (error) {
    console.error("Chat Error:", error);
    return "服务繁忙，请稍后再试。";
  }
};

/**
 * Smart Fill (Parsing).
 */
export const parsePropertyInfoWithAI = async (text: string, base64Image?: string): Promise<any> => {
    try {
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

        if (currentConfig.provider === 'GEMINI') {
            const parts: any[] = [{ text: prompt }];
            if (base64Image) {
                parts.unshift({ inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] } });
            }

            const response = await getGeminiClient().models.generateContent({
                model: currentConfig.modelName,
                contents: { parts },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ["RENT", "SALE"] },
                            category: { type: Type.STRING },
                            price: { type: Type.NUMBER },
                            area: { type: Type.NUMBER },
                            layout: { type: Type.STRING },
                            province: { type: Type.STRING },
                            city: { type: Type.STRING },
                            district: { type: Type.STRING },
                            address: { type: Type.STRING },
                            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                            description: { type: Type.STRING },
                            commuteInfo: { type: Type.STRING },
                            contacts: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT,
                                    properties: { name: { type: Type.STRING }, phone: { type: Type.STRING } }
                                }
                            }
                        }
                    }
                }
            });
            if (response.text) return JSON.parse(response.text);
        } else {
            // Generic Provider
            const result = await callOpenAICompatible("Return valid JSON.", prompt, true, base64Image);
            if (result) {
                const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(cleanJson);
            }
        }
        return null;
    } catch (error) {
        console.error("Smart Fill Error:", error);
        return null;
    }
};
