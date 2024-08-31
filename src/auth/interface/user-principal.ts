import { RoleType } from '../../shared/role-type.enum';

export interface UserPrincipal {
    readonly username: string;
    readonly id: string;
    readonly email: string;
    readonly roles: RoleType[];
    readonly is_2fa_enabled: boolean;
}
