
import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller('ai')
export class AiController {

    @Post('chat')
    async chatProxy(@Body() body: any, @Res() res: Response) {
        const apiKey = process.env.AI_API_KEY;
        let apiUrl = process.env.AI_API_URL || 'https://api.deepseek.com/chat/completions';

        // Robustness: Handle Base URL vs Full Endpoint
        if (process.env.AI_API_URL && !process.env.AI_API_URL.includes('/chat/completions')) {
            apiUrl = `${process.env.AI_API_URL.replace(/\/+$/, '')}/chat/completions`;
        }

        if (!apiKey) {
            console.error('[AI] Missing API Key');
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: 'AI_API_KEY not configured on server'
            });
        }

        const modelName = process.env.AI_MODEL_NAME;

        // Construct the upstream request body
        // If AI_MODEL_NAME is configured on server, force use it.
        // Otherwise use what frontend sent (or default).
        const payload = {
            ...body,
            model: modelName || body.model || 'deepseek-ai/DeepSeek-V3'
        };

        console.log(`[AI Proxy] Sending request to: ${apiUrl}`);
        console.log(`[AI Proxy] Using model: ${payload.model}`);

        try {
            // Forward the request to the AI Provider
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[AI Proxy] Upstream Error (${response.status}):`, errorText);
                return res.status(response.status).json({ error: 'Upstream API Error', details: errorText });
            }

            // Stream the response back
            const data = await response.json();
            return res.status(HttpStatus.OK).json(data);

        } catch (error) {
            console.error('AI Proxy Error:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Proxy failed' });
        }
    }
}
