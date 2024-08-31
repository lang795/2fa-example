import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Observable, from, of, throwError, EMPTY } from 'rxjs';
import { catchError, map, mergeMap, throwIfEmpty } from 'rxjs/operators';
import { USER_MODEL } from '../../database/constants';
import { User, UserDocument } from '../../database/schemas/user';
import { OTPAuthService } from '../otp/otp.service';

@Injectable()
export class UserService {
    constructor(
        @Inject(USER_MODEL) private userModel: Model<UserDocument>,
        private readonly otpAuthService: OTPAuthService,
    ) { }

    onOffSetup2FA(username: string, enable2FA: boolean): Observable<{ data: { qrCodeUrl?: string }; status: string }> {
        return this.findByUsername(username).pipe(
            mergeMap(user => user ? of(user) : throwError(() => new Error('User not found'))),
            mergeMap(user => {
                if (enable2FA) {
                    return this.otpAuthService.genTwoFactorAuthSecret(user).pipe(
                        mergeMap(({ secret, qrCodeUrl }) => {
                            user.secret_2fa = secret;
                            user.is_2fa_enabled = true;
                            return this.updateUser(user).pipe(
                                map(() => ({ status: 'success', data: { qrCodeUrl } }))
                            );
                        })
                    );
                } else {
                    user.secret_2fa = undefined;
                    user.is_2fa_enabled = false;
                    return this.updateUser(user).pipe(
                        map(() => ({ status: 'success', data: {} }))
                    );
                }
            }),
            catchError(error => of({
                status: 'error',
                data: { qrCodeUrl: '' },
                message: error.message,
            }))
        );
    }

    findByUsername(username: string): Observable<User> {
        return from(this.userModel.findOne({ username }).exec()).pipe(
            catchError(error => {
                return of(null);
            })
        );
    }


    updateUser(user: User): Observable<User> {
        return from(
            this.userModel.findByIdAndUpdate(user._id, user, { new: true }).exec()
        ).pipe(
            map(updatedUser => {
                if (!updatedUser) {
                    throw new NotFoundException(`User with id ${user._id} not found`);
                }
                return updatedUser;
            }),
            catchError(error => throwError(() => new Error(error.message)))
        );
    }

    findByAuthReq(username: string): Observable<{ data: Partial<User>; status: string }> {
        return this.findByUsername(username).pipe(
            map(user => {
                if (!user) {
                    return {
                        data: {},
                        status: 'error',
                        message: 'User not found',
                    };
                }
                return {
                    data: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        avatar: user.avatar,
                        roles: user.roles
                    },
                    status: 'ok'
                };
            }),
            catchError(error => of({
                status: 'error',
                message: error.message,
                data: {}
            }))
        );
    }

    findByUserId(id: string): Promise<User> {
        return this.userModel.findOne({ _id: id }).exec();
    }
}
