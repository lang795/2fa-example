import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type OTPTokenDocument = HydratedDocument<OTPToken>;

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class OTPToken {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: string;

    @Prop({ type: Date, default: null })
    usedAt?: Date;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    owner: string;

    @Prop({ type: Date, required: true })
    expiresAt: Date;

    @Prop({ required: true, unique: true })
    token: string;

    @Prop({ required: true, unique: true })
    secret: string;

}

export const OTPTokenSchema = SchemaFactory.createForClass(OTPToken);

OTPTokenSchema.pre(['find', 'findOne'], function () {
    this.populate({
        path: 'owner',
    });
});
