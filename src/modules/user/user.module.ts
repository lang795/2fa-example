import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from '../../database/database.module';
import { OTPAuthModule } from '../otp/otp.module';

@Module({
    imports: [DatabaseModule, OTPAuthModule],
    providers: [UserService],
    exports: [UserService],
    controllers: [ProfileController, UserController],
})
export class UserModule { }
