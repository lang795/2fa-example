import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { hash } from 'bcrypt';
import { RoleType } from '../../shared/role-type.enum';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class User {
    static findById(owner: string) {
        throw new Error('Method not implemented.');
    }
    @Prop({ required: true, unique: true, trim: true })
    username: string;

    @Prop({ required: true, unique: true, trim: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ trim: true })
    first_name?: string;

    @Prop({ trim: true })
    last_name?: string;

    @Prop({ trim: true })
    avatar?: string;

    @Prop({ default: true })
    is_2fa_enabled?: boolean;

    @Prop({ default: true })
    is_2fa_authen?: boolean;

    @Prop({ default: '' })
    qr_code?: string;

    @Prop({ trim: true })
    secret_2fa?: string;


    @Prop({ type: [String], enum: RoleType, default: [] })
    roles?: RoleType[];

    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: string;

    // Virtual field for full name
    get name(): string {
        return `${this.first_name ?? ''} ${this.last_name ?? ''}`.trim();
    }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save hook to hash password
UserSchema.pre<UserDocument>('save', async function (next) {
    if (!this.isModified('password')) return next();

    const hashedPassword = await hash(this.password, 12);
    this.password = hashedPassword;

    next();
});

export const createUserModel = (conn: Connection): Model<UserDocument> =>
    conn.model<UserDocument>('User', UserSchema, 'users');
