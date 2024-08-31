import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { ConfigModule, ConfigType } from '@nestjs/config';
import * as session from 'express-session';
import * as passport from 'passport';
import { SessionSerializer } from './session.serializer';
import { UserModule } from '../modules/user/user.module';
import { AuthController } from './auth.controller';
import jwtConfig from '../configs/jwt.config';
import { OTPAuthModule } from 'src/modules/otp/otp.module';

@Module({
    imports: [
        ConfigModule.forFeature(jwtConfig),
        UserModule,
        PassportModule.register({ defaultStrategy: 'jwt', session: true }),
        JwtModule.registerAsync({
            imports: [ConfigModule.forFeature(jwtConfig)],
            useFactory: (config: ConfigType<typeof jwtConfig>) => ({
                secret: config.secretKey,
                signOptions: { expiresIn: config.expiresIn },
            }),
            inject: [jwtConfig.KEY],
        }),
        OTPAuthModule
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy, SessionSerializer],
    exports: [AuthService],
    controllers: [AuthController],
})

export class AuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(
                session({
                    secret: process.env.SESSION_SECRET || 'batd-apt',
                    resave: false,
                    saveUninitialized: false,
                    cookie: {
                        sameSite: true,
                        httpOnly: false,
                        maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 60000,
                    }
                }),
                passport.initialize(),
                passport.session(),
            )
            .forRoutes('*');
    }
}