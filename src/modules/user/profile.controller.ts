import { Controller, Get, Req, UseGuards, Post, Body, Res } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { UserService } from './user.service';
import { User } from '../../database/schemas/user';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Controller()
export class ProfileController {

    constructor(private userService: UserService) {}

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req: Request):  Observable<{ data: Partial<User>; status: string }> {
        const user = req["user"] as { username: string };
        return this.userService.findByAuthReq(user.username);
    }

    @UseGuards(JwtAuthGuard)
    @Post('setup-2fa')
    onSetup2FA(@Req() req: Request, @Body() enable2FA: boolean): Observable<{ data: { qrCodeUrl?: string }; status: string }> {
        const user = req["user"] as { username: string };
        return this.userService.onOffSetup2FA(user.username, enable2FA);
    }
}
