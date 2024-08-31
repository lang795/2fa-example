import { Request } from 'express';
import { UserPrincipal } from './user-principal';
import { Session } from 'express-session';

export interface AuthenticatedRequest extends Request {
    readonly user: UserPrincipal;
    readonly session: Session; 
}