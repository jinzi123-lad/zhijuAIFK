
import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller('ai')
export class AiController {

    @Post('chat')
    async chatProxy(@Body() body: any, @Res() res: Response) {
        const apiKey = process.env.AI_API_KEY;
        const apiUrl = process.env.AI_API_URL || 'https://api.deepseek.com/v1/chat/completions'; // Default to DeepSeek or OpenAI

        if (!apiKey) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: 'AI_API_KEY not configured on server'
            });
        }

        try {
            // Forward the request to the AI Provider
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
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
