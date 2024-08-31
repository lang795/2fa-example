import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from '../../configs/jwt.config';
import { ConfigType } from '@nestjs/config';
import { JwtPayload } from '../interface/jwt-payload';
import { UserPrincipal } from '../interface/user-principal';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(@Inject(jwtConfig.KEY) config: ConfigType<typeof jwtConfig>) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.secretKey,
        });
    }

    validate(payload: JwtPayload): UserPrincipal {
        return {
            username: payload.upn,
            email: payload.email,
            id: payload.sub,
            roles: payload.roles,
            is_2fa_enabled: payload.is_2fa_enabled,
        };
    }
}
