import { RoleType } from "../../shared/role-type.enum";

export interface JwtPayload {
    readonly upn: string;
    readonly sub: string;
    readonly email: string;
    readonly roles: RoleType[];
    readonly is_2fa_enabled: boolean;
}
