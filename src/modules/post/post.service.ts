import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Post, PostDocument } from '../../database/schemas/post';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { POST_MODEL } from 'src/database/constants';

@Injectable()
export class PostService {
    constructor(
        @Inject(POST_MODEL) private postModel: Model<PostDocument>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    findById(id: string): Observable<{ post: Post }> {
        return from(
            this.postModel.findById(id)
                .populate({
                    path: 'owner',
                    select: '_id email username avatar',
                })
                .exec()
        ).pipe(
            map((post: Post | null) => {
                if (!post) {
                    throw new NotFoundException(`Post with id ${id} not found`);
                }
                return { post };
            }),
            catchError(error => throwError(() => new Error(error.message)))
        );
    }

    async getById(id: string): Promise<Post> {
        const post = await this.cacheManager.get<Post>(id);
        if (post) return post;

        const postDB = await this.postModel.findById(id)
            .populate({
                path: 'owner',
                select: '_id email username avatar',
            })
            .exec();
        if (!postDB) {
            throw new NotFoundException(`Post with id ${id} not found`);
        }
        await this.cacheManager.set(postDB._id.toString(), postDB);
        return postDB;
    }
}
