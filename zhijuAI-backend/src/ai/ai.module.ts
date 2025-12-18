
import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { SupabaseModule } from '../common/supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [AiController],
})
export class AiModule { }
