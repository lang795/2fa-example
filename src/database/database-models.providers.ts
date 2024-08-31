import { Connection } from 'mongoose';
import {
    DATABASE_CONNECTION,
    USER_MODEL,
    POST_MODEL,
    OTPTOKEN_MODEL
} from './constants';

import { UserSchema } from './schemas/user';
import { PostSchema } from './schemas/post';
import { OTPTokenSchema } from './schemas/otp-token';

export const databaseModelsProviders = [
    {
        provide: USER_MODEL,
        useFactory: (connection: Connection) => connection.model('User', UserSchema),
        inject: [DATABASE_CONNECTION],
    },
    {
        provide: POST_MODEL,
        useFactory: (connection: Connection) => connection.model('Post', PostSchema),
        inject: [DATABASE_CONNECTION],
    },
    {
        provide: OTPTOKEN_MODEL,
        useFactory: (connection: Connection) => connection.model('OTPToken', OTPTokenSchema),
        inject: [DATABASE_CONNECTION],
    }
];
