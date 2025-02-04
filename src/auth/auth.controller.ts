import { Controller, Post, Req, Res, Body, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map} from 'rxjs/operators';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { OTPAuthGuard } from './guard/otp-auth.guard';
import { AuthenticatedRequest } from './interface/authenticated-request';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    login(@Req() req: AuthenticatedRequest, @Res() res: Response): Observable<Response> {
        console.log(req.user)
        return this.authService.login(req.user)
            .pipe(
                map(token => {
                    return res
                        .header('Authorization', 'Bearer ' + token.access_token)
                        .json(token)
                        .send()
                })
            );
    }

    @UseGuards(LocalAuthGuard)
    @Post('logout')
    logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
        req.session.destroy((err: any) => {
            if (err) {
                return res.status(500).json({ message: 'Logout failed' });
            }
            res.clearCookie('connect.sid');
            res.json({ message: 'Logout successful' });
        });
    }

    @Post('verify_otp')
    @UseGuards(OTPAuthGuard)
    verifyOneTimePassword(@Req() req: AuthenticatedRequest, @Res() res: Response): Observable<Response> {
        return this.authService.login(req.user)
            .pipe(
                map(token => {
                    return res
                        .header('Authorization', 'Bearer ' + token.access_token)
                        .json(token)
                        .send()
                })
            );
    }
}
