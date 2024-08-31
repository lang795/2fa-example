import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-local';
import { lastValueFrom } from 'rxjs';
import jwtConfig from 'src/configs/jwt.config';
import { AuthService } from '../auth.service';
import { UserPrincipal } from '../interface/user-principal';

@Injectable()
export class OTPStrategy extends PassportStrategy(Strategy, 'otp') {
    constructor(
            private authService: AuthService,
            @Inject(jwtConfig.KEY) config: ConfigType<typeof jwtConfig>
        ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.secretKey,
        });
    }

    async validate(otpCode: string , jwtToken: string): Promise<UserPrincipal> {
        const user: UserPrincipal = await lastValueFrom(
            this.authService.validateOTP(otpCode, jwtToken),
        );

        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}
