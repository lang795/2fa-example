import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true
})
export class Post {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: string;

    @Prop({ required: true, index: true })
    name: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    owner: string;

    @Prop({ required: true, default: "" })
    content: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.pre(['find', 'findOne'], function () {
    this.populate({
        path: 'owner',
        select: '_id email username avatar',
    });
});