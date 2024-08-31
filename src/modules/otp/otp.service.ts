import { Injectable, Inject } from '@nestjs/common';
import { Observable, from, throwError, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { User } from '../../database/schemas/user';
import { Model } from 'mongoose';
import crypto from 'crypto';
import { OTPToken } from 'src/database/schemas/otp-token';
import { OTPTOKEN_MODEL } from 'src/database/constants';

@Injectable()
export class OTPAuthService {
    constructor(
        @Inject(OTPTOKEN_MODEL) private OTPTokenModel: Model<OTPToken>,
    ) { }

    genTwoFactorAuthSecret(user: User): Observable<{ secret: string; qrCodeUrl: string }> {
        const secret = speakeasy.generateSecret({ name: user.username });

        return from(qrcode.toDataURL(secret.otpauth_url)).pipe(
            map(qrCodeUrl => ({
                secret: secret.base32,
                qrCodeUrl: qrCodeUrl as string,
            })),
            catchError(error => throwError(() => new Error(error.message)))
        );
    }

    validate2FAToken(secret: string, token: string): Promise<boolean> {
        return speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
        });
    }

    genURL2FAToken(userId: string): Observable<string> {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        const newTokenData = {
            token,
            owner: userId,
            expiresAt: expiresAt.toISOString(),
            usedAt: null
        };

        this.OTPTokenModel.create(newTokenData);
        return of(token);
    }

    findUserByOTP(otpCode: string, jwt: string): Observable<User> {
        return from(this.OTPTokenModel.findOne({ token: jwt }).populate('owner').exec()).pipe(
            switchMap(otpToken => {
                if (!otpToken || otpToken.usedAt || new Date(otpToken.expiresAt) < new Date()) {
                    return throwError(() => new Error('Invalid or expired OTP token'));
                }

                return from(this.validate2FAToken(otpToken.secret, otpCode)).pipe(
                    switchMap(isValid => {
                        if (!isValid) {
                            return throwError(() => new Error('Invalid OTP code'));
                        }

                        otpToken.usedAt = new Date();
                        return from(otpToken.save()).pipe(
                            switchMap(() => of(otpToken.owner as unknown as User)),
                            catchError(() => throwError(() => new Error('User not found')))
                        );
                    }),
                    catchError(error => throwError(() => new Error(error.message)))
                );
            }),
            catchError(error => throwError(() => new Error(error.message)))
        );
    }
}
