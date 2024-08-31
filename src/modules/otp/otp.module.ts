import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { OTPAuthService } from './otp.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [
        DatabaseModule,
        CacheModule.register(),
    ],
    providers: [OTPAuthService],
    exports: [OTPAuthService]
})
export class OTPAuthModule { }
