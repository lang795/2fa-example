import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RoleType } from '../../shared/role-type.enum';
import { AuthenticatedRequest } from '../interface/authenticated-request';
const HAS_ROLES_KEY = 'has-roles';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.reflector.get<RoleType[]>(
            HAS_ROLES_KEY,
            context.getHandler(),
        );
        if (!roles || roles.length == 0) {
            return true;
        }

        const {
            user,
        } = context.switchToHttp().getRequest() as AuthenticatedRequest;
        return user.roles && user.roles.some((r) => roles.includes(r));
    }
}
