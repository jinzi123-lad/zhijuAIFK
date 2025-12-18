import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
    async wechatLogin(code: string) {
        console.log('Received WeChat Code:', code);

        // In real env, call: https://api.weixin.qq.com/sns/jscode2session
        // For now, Mock response
        if (!code) throw new UnauthorizedException('Code is required');

        return {
            status: 'success',
            token: 'mock-jwt-token-for-' + code,
            userInfo: {
                id: 'user_123',
                role: 'tenant',
                name: 'WeChat User'
            }
        };
    }
}
