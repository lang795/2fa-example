import { SetMetadata } from '@nestjs/common';
import { RoleType } from '../../shared/role-type.enum';
const HAS_ROLES_KEY = 'has-roles';

export const HasRoles = (...args: RoleType[]) => SetMetadata(HAS_ROLES_KEY, args);
