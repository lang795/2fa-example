import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { from, Observable, of, throwError } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';
import { OTPAuthService } from 'src/modules/otp/otp.service';

import { UserService } from '../modules/user/user.service';
import { AccessToken } from './interface/access-token';
import { JwtPayload } from './interface/jwt-payload';
import { UserPrincipal } from './interface/user-principal';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private otpAuthService: OTPAuthService,
    ) { }

    validateUser(username: string, pass: string): Observable<UserPrincipal> {
        return this.userService.findByUsername(username).pipe(
            mergeMap(user =>
                user ? of(user) : throwError(() => new UnauthorizedException('Username or password is not matched'))
            ),
            mergeMap(user =>
                this.comparePassword(pass, user.password).pipe(
                    map(isMatched => {
                        if (isMatched) {
                            const { _id, username, email, roles } = user;
                            return { id: _id, username, email, roles } as UserPrincipal;
                        } else {
                            throw new UnauthorizedException('Username or password is not matched');
                        }
                    })
                )
            )
        );
    }

    login(user: UserPrincipal): Observable<AccessToken> {
        const payload: JwtPayload = {
            upn: user.username,
            sub: user.id,
            email: user.email,
            roles: user.roles,
            is_2fa_enabled: user.is_2fa_enabled
        };

        if (user.is_2fa_enabled) {
            return from(this.otpAuthService.genURL2FAToken(user.id)).pipe(
                map(access_token => ({
                    access_token,
                    require2FA: true,
                })),
            );
        } else {
            return from(this.jwtService.signAsync(payload)).pipe(
                map(access_token => ({
                    access_token,
                    require2FA: false,
                }))
            );
        }
    }

    validateOTP(otpCode: string, jwt: string): Observable<UserPrincipal> {
        return this.otpAuthService.findUserByOTP(otpCode, jwt).pipe(
            mergeMap(user => {
                if (!user) {
                    return throwError(() => new UnauthorizedException('Invalid OTP or token expired'));
                }
                const { _id, username, email, roles } = user;
                return of({ id: _id, username, email, roles } as UserPrincipal);
            }),
            catchError(error => throwError(() => new UnauthorizedException(error.message)))
        );
    }

    private comparePassword(enteredPassword: string, hashedPassword: string): Observable<boolean> {
        return from(compare(enteredPassword, hashedPassword) as Promise<boolean>);
    }
}
