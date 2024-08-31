import { IsNotEmpty } from 'class-validator';
export class OTPDto {
    @IsNotEmpty()
    readonly token: string;

    @IsNotEmpty()
    readonly otp: string;
}
