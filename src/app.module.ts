import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './auth/auth.module';
import { OTPAuthModule } from './modules/otp/otp.module';

@Module({
    imports: [
        ConfigModule.forRoot({ ignoreEnvFile: true }),
        DatabaseModule,
        UserModule,
        AuthModule,
        OTPAuthModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
