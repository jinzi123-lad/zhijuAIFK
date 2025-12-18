import { SupabaseModule } from './common/supabase/supabase.module';

@Module({
    imports: [
        AuthModule,
        DashboardModule,
        SupabaseModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
