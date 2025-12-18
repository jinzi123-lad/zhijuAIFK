
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../common/supabase/supabase.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly supabase: SupabaseService,
    ) { }

    async wechatLogin(code: string, role: string = 'tenant') {
        // 1. In a real scenario, we exchange 'code' for 'openid' with WeChat API
        // const { openid } = await this.wechatService.jscode2session(code);

        // For now, we simulate a user ID based on role
        const mockOpenId = role === 'landlord' ? 'mock_landlord_123' : 'mock_tenant_456';

        // 2. Ideally, check if user exists in Supabase
        // const { data: user } = await this.supabase.getClient().from('users').select('*').eq('wechat_openid', mockOpenId).single();

        // 3. Generate JWT payload
        const payload = {
            sub: mockOpenId,
            username: role === 'landlord' ? 'Landlord User' : 'Tenant User',
            role: role
        };

        return {
            accessToken: this.jwtService.sign(payload),
            user: payload
        };
    }
}
