import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as express from 'express';

let app: any;

async function bootstrap() {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    const nestApp = await NestFactory.create(AppModule, adapter);
    nestApp.enableCors();
    await nestApp.init();
    return expressApp;
}

export default async (req: any, res: any) => {
    if (!app) {
        app = await bootstrap();
    }
    app(req, res);
};
