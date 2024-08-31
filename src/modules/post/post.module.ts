import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { PostService } from './post.service';
import { CacheModule } from '@nestjs/cache-manager';
import { PostController } from './post.controller';

@Module({
    imports: [
        DatabaseModule,
        CacheModule.register(),
    ],
    controllers: [PostController],
    providers: [PostService],
    exports: [PostService]
})
export class RoomModule { }
